import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import * as ImagePicker from "expo-image-picker";
import DatePicker from "react-native-date-picker";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { useRouter } from "expo-router";
import { getUserId } from "@/services/storage";
import { EventService } from "@/axios/eventService";

export default function CreateEventScreen() {
  const [image, setImage] = useState("");
  const [form, setForm] = useState<ICreateEvent>(new ICreateEvent());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<{ [key: string]: number }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchRoomsAndEquipments = async () => {
      try {
        const roomsData = await EventService.getRooms();
        const equipmentsData = await EventService.getEquipments();
        setRooms(roomsData);
        setEquipments(equipmentsData);
      } catch (error) {
        console.error("Lỗi khi tải danh sách phòng và thiết bị:", error);
      }
    };
    fetchRoomsAndEquipments();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [6, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateEvent = async () => {
    setIsLoading(true);
    if (
      !form.title ||
      !form.end_date ||
      !form.event_date ||
      !form.max_attendees ||
      !form.location_url
    ) {
      Alert.alert("Vui lòng nhập đầy đủ thông tin bắt buộc (gồm chọn phòng học)");
      setIsLoading(false);
      return;
    }
    if (form.event_date >= form.end_date) {
      setErrorMsg("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
      setIsLoading(false);
      return;
    }
    setErrorMsg("");

    form.host_id = (await getUserId()) ?? "";
    form.allowed_domain = "all";
    form.created_at = new Date().toISOString();
    form.form_config = JSON.stringify({});
    form.banner_url = image;
    form.status = "DRAFT";
    form.room_id = form.room_id || undefined;
    form.equipments = JSON.stringify(selectedEquipments);

    try {
      await EventService.createEvent(form);
      router.push("/HostDashBoardScreen");
    } catch (error: any) {
      console.log("Error creating event:", error);
      const errorMsg = error.response?.data?.message || error.message || "Tạo sự kiện thất bại!";
      Alert.alert("Lỗi", Array.isArray(errorMsg) ? errorMsg.join("\n") : errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = createStyles();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.mainContainer}
    >
      <View style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <CustomText variant="bold" style={styles.headerText}>
            CREATE NEW EVENT
          </CustomText>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
            {/* EVENT INFORMATION CARD */}
            <View style={styles.card}>
              <CustomText variant="bold" style={styles.cardSectionTitle}>
                EVENT INFORMATION
              </CustomText>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <CustomText variant="medium" style={styles.label}>
                  Event Title{" "}
                </CustomText>
                <CustomText style={{ color: "red" }}>Bắt buộc</CustomText>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.wrapperInput}
                  placeholder="e.g, Tech Innovators Conference"
                  placeholderTextColor="#BBB"
                  value={form.title}
                  onChangeText={(val) => setForm({ ...form, title: val })}
                />
              </View>

              <CustomText variant="medium" style={styles.label}>
                Event Image (6:9)
              </CustomText>
              <TouchableOpacity
                style={[styles.imageContainer, image && styles.imageActive]}
                onPress={pickImage}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <View style={styles.cameraCircle}>
                      <Ionicons name="camera-outline" size={24} color="#FFF" />
                    </View>
                    <CustomText variant="medium" style={styles.uploadMainText}>
                      Tap to add
                    </CustomText>
                    <CustomText style={styles.uploadSubText}>
                      Recommended (6:9)
                    </CustomText>
                  </View>
                )}
              </TouchableOpacity>

              {/* DESCRIPTION */}
              <CustomText variant="medium" style={styles.label}>
                Description
              </CustomText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    alignItems: "flex-start",
                    paddingVertical: 10,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.wrapperInput,
                    styles.textAreaInput,
                    { minHeight: 80, height: "auto" },
                  ]}
                  placeholder="Provide a detailed description..."
                  placeholderTextColor="#BBB"
                  multiline={true}
                  value={form.description}
                  onChangeText={(val) => setForm({ ...form, description: val })}
                />
              </View>

              {/* TRƯỜNG THÔNG TIN SỰ KIỆN TRƯỜNG */}
              <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 15 }} />
              <CustomText variant="bold" style={styles.cardSectionTitle}>
                THÔNG TIN BỔ SUNG
              </CustomText>

              <CustomText variant="medium" style={styles.label}>Loại sự kiện</CustomText>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.wrapperInput}
                  placeholder="VD: Hội thảo, Tọa đàm, Lễ hội..."
                  placeholderTextColor="#BBB"
                  value={form.event_type}
                  onChangeText={(val) => setForm({ ...form, event_type: val })}
                />
              </View>

              <CustomText variant="medium" style={styles.label}>Điểm rèn luyện</CustomText>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.wrapperInput}
                  placeholder="VD: 5"
                  keyboardType="numeric"
                  placeholderTextColor="#BBB"
                  value={form.training_points ? String(form.training_points) : ""}
                  onChangeText={(val) => setForm({ ...form, training_points: Number(val) })}
                />
              </View>

              <CustomText variant="medium" style={styles.label}>Đối tượng tham gia</CustomText>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.wrapperInput}
                  placeholder="VD: Sinh viên toàn trường..."
                  placeholderTextColor="#BBB"
                  value={form.target_audience}
                  onChangeText={(val) => setForm({ ...form, target_audience: val })}
                />
              </View>

              <CustomText variant="medium" style={styles.label}>Quyền lợi tham gia</CustomText>
              <View style={[styles.inputWrapper, { alignItems: "flex-start", paddingVertical: 10 }]}>
                <TextInput
                  style={[styles.wrapperInput, styles.textAreaInput, { minHeight: 60, height: "auto" }]}
                  placeholder="VD: Giấy chứng nhận, Teabreak..."
                  placeholderTextColor="#BBB"
                  multiline={true}
                  value={form.benefits}
                  onChangeText={(val) => setForm({ ...form, benefits: val })}
                />
              </View>
            </View>

            {/* DATE & LOCATION CARD */}
            <View style={styles.card}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <CustomText variant="bold" style={styles.cardSectionTitle}>
                  DATE & LOCATION
                </CustomText>
                <CustomText style={{ color: "red" }}>Bắt buộc</CustomText>
              </View>
              <View style={[styles.inputWrapper, {paddingHorizontal: 0}]}>
                <TouchableOpacity
                  style={styles.dateTimeSelector}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Ionicons
                    name="calendar-clear-outline"
                    size={18}
                    color="#1a2a44"
                  />
                  <CustomText variant="medium" style={styles.selectorMainText}>
                    {form.event_date
                      ? new Date(form.event_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Start Date"}
                  </CustomText>
                </TouchableOpacity>
                </View>
                <View style={[styles.inputWrapper, {paddingHorizontal: 0}]}>

                {/* Nút chọn End Date */}
                <TouchableOpacity
                  style={styles.dateTimeSelector}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Ionicons name="time-outline" size={18} color="#1a2a44" />
                  <CustomText variant="medium" style={styles.selectorMainText}>
                    {form.end_date
                      ? new Date(form.end_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute:"2-digit",
                        })
                      : "End Date"}
                  </CustomText>
                </TouchableOpacity>
                {showStartPicker && (
                  <DatePicker
                    modal
                    open={showStartPicker}
                    date={new Date()}
                    mode="datetime"
                    onConfirm={(selectedDate) => {
                      setShowStartPicker(false);
                      setForm({
                        ...form,
                        event_date: selectedDate.toISOString(),
                      });
                    }}
                    onCancel={() => {
                      setShowStartPicker(false);
                    }}
                  />
                )}

                {showEndPicker && (
                  <DatePicker
                    modal
                    open={showEndPicker}
                    date={new Date()}
                    mode="datetime"
                    onConfirm={(selectedDate) => {
                      setShowEndPicker(false);
                      setForm({
                        ...form,
                        end_date: selectedDate.toISOString(),
                      });
                    }}
                    onCancel={() => {
                      setShowEndPicker(false);
                    }}
                  />
                )}
              </View>
              {errorMsg ? (
                <CustomText style={{ color: "red", marginBottom: 10 }}>{errorMsg}</CustomText>
              ) : null}
              <CustomText variant="medium" style={styles.label}>
                Select Room / Phòng học (Bắt buộc nếu không nhập địa điểm khác)
              </CustomText>
              <View style={styles.roomsContainer}>
                {rooms.map((room) => {
                  const isSelected = form.room_id === room.id;
                  return (
                    <TouchableOpacity
                      key={room.id}
                      style={[
                        styles.roomChip,
                        isSelected && styles.roomChipSelected,
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setForm({
                            ...form,
                            room_id: undefined,
                            location_url: "",
                          });
                        } else {
                          setForm({
                            ...form,
                            room_id: room.id,
                            location_url: room.name,
                          });
                        }
                      }}
                    >
                      <Ionicons
                        name="home-outline"
                        size={14}
                        color={isSelected ? "#FFF" : "#1a2a44"}
                      />
                      <CustomText
                        variant="bold"
                        style={[
                          styles.roomChipText,
                          isSelected && styles.roomChipTextSelected,
                        ]}
                      >
                        {room.name}
                      </CustomText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <CustomText variant="medium" style={styles.label}>
                Or Custom Location / Hoặc Địa điểm khác
              </CustomText>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.wrapperInput}
                  placeholder="Venue / Location (VD: Hội trường C...)"
                  placeholderTextColor="#BBB"
                  value={form.location_url}
                  onChangeText={(val) =>
                    setForm({ ...form, location_url: val })
                  }
                />
              </View>
            </View>

            {/* EQUIPMENT CARD */}
            <View style={styles.card}>
              <CustomText variant="bold" style={styles.cardSectionTitle}>
                REQUEST EQUIPMENT / MƯỢN THIẾT BỊ
              </CustomText>
              {equipments.map((eq) => {
                const qty = selectedEquipments[eq.id] || 0;
                return (
                  <View key={eq.id} style={styles.equipmentRow}>
                    <View style={{ flex: 1 }}>
                      <CustomText variant="medium" style={styles.equipmentName}>
                        {eq.name}
                      </CustomText>
                      <CustomText style={styles.equipmentSubText}>
                        Sẵn có: {eq.quantity}
                      </CustomText>
                    </View>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => {
                          if (qty > 0) {
                            setSelectedEquipments({
                              ...selectedEquipments,
                              [eq.id]: qty - 1,
                            });
                          }
                        }}
                      >
                        <Ionicons name="remove" size={18} color={Colors.color.primary} />
                      </TouchableOpacity>
                      <CustomText variant="bold" style={styles.stepperVal}>
                        {qty}
                      </CustomText>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => {
                          if (qty < eq.quantity) {
                            setSelectedEquipments({
                              ...selectedEquipments,
                              [eq.id]: qty + 1,
                            });
                          } else {
                            Alert.alert("Thông báo", `Số lượng ${eq.name} trong kho chỉ còn ${eq.quantity}`);
                          }
                        }}
                      >
                        <Ionicons name="add" size={18} color={Colors.color.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* CAPACITY & PRICE */}
            <View style={styles.card}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <CustomText variant="bold" style={styles.cardSectionTitle}>
                  CAPACITY
                </CustomText>
                <CustomText style={{ color: "red" }}>
                  Bắt buộc
                </CustomText>
              </View>
              <View style={styles.ticketRow}>
                <View
                  style={[styles.inputWrapper, { flex: 1 }]}
                >
                  <TextInput
                    style={styles.wrapperInput}
                    placeholder="Capacity (VD: 100)"
                    placeholderTextColor="#BBB"
                    keyboardType="numeric"
                    onChangeText={(val) =>
                      setForm({ ...form, max_attendees: Number(val) })
                    }
                  />
                </View>
              </View>
            </View>

            {/* ACTIONS */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.btnCreate}
                onPress={handleCreateEvent}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <CustomText variant="bold" style={styles.btnCreateText}>
                    Tạo sự kiện
                  </CustomText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </View>
  </KeyboardAvoidingView>
  );
}

function createStyles() {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: "#F0F3F7",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    header: {
      backgroundColor: Colors.color.primary,
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      justifyContent: "center",
      alignItems: "center",
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    headerText: {
      fontSize: 20,
      textAlign: "center",
      color: "white",
      letterSpacing: 1,
    },
    card: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    cardSectionTitle: {
      fontSize: 12,
      marginBottom: 15,
      color: "#AAA",
      letterSpacing: 1.2,
    },
    label: {
      fontSize: 14,
      marginBottom: 8,
      color: "#555",
    },

    // INPUT WRAPPERS
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F5F7FA",
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 15,
    },
    wrapperInput: {
      flex: 1,
      height: 48,
      fontSize: 15,
      color: "#333",
    },
    textAreaInput: {
      textAlignVertical: "top",
    },

    // IMAGE PICKER
    imageContainer: {
      height: 120,
      borderWidth: 1,
      borderColor: "#cccccccb",
      borderStyle: "dashed",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      overflow: "hidden",
      backgroundColor: "#FFF",
    },
    imageActive: {
      borderStyle: "solid",
      borderColor: "#1a2a44",
    },
    uploadPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
    },
    cameraCircle: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: "#1a2a44",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    uploadMainText: {
      fontSize: 14,
      color: "#333",
    },
    uploadSubText: {
      fontSize: 12,
      color: "#888",
      marginTop: 2,
    },
    previewImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },

    // DATE
    selectorRow: {
      alignItems: "flex-start",
      marginBottom: 15,
    },
    dateTimeSelector: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      backgroundColor: "#F5F7FA",
      padding: 14,
      borderRadius: 10,
    },
    selectorMainText: {
      marginLeft: 8,
      fontSize: 14,
      color: "#1a2a44",
    },

    // TICKETING
    ticketRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    // ACTIONS
    footer: {
      flexDirection: "row",
      marginTop: 10,
      marginBottom: 40,
    },
    btnCreate: {
      flex: 1,
      backgroundColor: Colors.color.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    btnCreateText: {
      color: "white",
      fontSize: 16,
    },
    btnSecondaryText: {
      color: Colors.color.primary,
      fontSize: 15,
    },
    roomsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginVertical: 10,
    },
    roomChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F5F7FA",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      gap: 6,
    },
    roomChipSelected: {
      backgroundColor: Colors.color.primary,
      borderColor: Colors.color.primary,
    },
    roomChipText: {
      fontSize: 13,
      color: "#1a2a44",
    },
    roomChipTextSelected: {
      color: "#FFF",
    },
    equipmentRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#EDF2F7",
    },
    equipmentName: {
      fontSize: 15,
      color: "#2D3748",
    },
    equipmentSubText: {
      fontSize: 12,
      color: "#718096",
      marginTop: 2,
    },
    stepperContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F5F7FA",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      padding: 4,
    },
    stepperBtn: {
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#FFF",
      borderRadius: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    stepperVal: {
      paddingHorizontal: 12,
      fontSize: 15,
      color: "#2D3748",
      textAlign: "center",
      minWidth: 30,
    },
  });
}