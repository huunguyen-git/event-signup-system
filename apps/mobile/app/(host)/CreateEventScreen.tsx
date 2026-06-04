import { useState, useEffect, useMemo } from "react";
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
  Modal,
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
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [selectedRoomForSchedule, setSelectedRoomForSchedule] = useState<any>(null);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date>(new Date());
  const [roomSearchQuery, setRoomSearchQuery] = useState("");
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const router = useRouter();

  const filteredRooms = useMemo(() => {
    if (!roomSearchQuery.trim()) return rooms;
    return rooms.filter((r) =>
      r.name.toLowerCase().includes(roomSearchQuery.toLowerCase())
    );
  }, [rooms, roomSearchQuery]);

  useEffect(() => {
    const fetchRoomsAndEquipmentsAndEvents = async () => {
      try {
        const roomsData = await EventService.getRooms();
        const equipmentsData = await EventService.getEquipments();
        const eventsData = await EventService.getEvents();
        setRooms(roomsData);
        setEquipments(equipmentsData);
        setAllEvents(eventsData);
      } catch (error) {
        console.error("Lỗi khi tải danh sách phòng, thiết bị và sự kiện:", error);
      }
    };
    fetchRoomsAndEquipmentsAndEvents();
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getShortDayName = (date: Date) => {
    const day = date.getDay();
    const names = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return names[day];
  };

  const getScheduleForDate = (room: any, date: Date) => {
    if (!room) return { booked: [], free: [] };
    const dayStart = new Date(date);
    dayStart.setHours(7, 0, 0, 0); // 7:00 AM
    const dayEnd = new Date(date);
    dayEnd.setHours(22, 0, 0, 0); // 10:00 PM

    const dayStartMidnight = new Date(date);
    dayStartMidnight.setHours(0, 0, 0, 0);
    const dayEndMidnight = new Date(date);
    dayEndMidnight.setHours(23, 59, 59, 999);

    const roomEvents = allEvents.filter((evt) => {
      if (evt.room_id !== room.id) return false;
      if (evt.status === "CANCELLED" || evt.status === "DRAFT") return false;
      
      const evtStart = new Date(evt.event_date);
      const evtEnd = evt.end_date ? new Date(evt.end_date) : evtStart;
      return evtStart < dayEndMidnight && evtEnd > dayStartMidnight;
    });

    const bookings = roomEvents.map((evt) => {
      const start = Math.max(new Date(evt.event_date).getTime(), dayStart.getTime());
      const end = Math.min(new Date(evt.end_date || evt.event_date).getTime(), dayEnd.getTime());
      return {
        title: evt.title,
        start,
        end,
      };
    }).filter(b => b.start < b.end);

    bookings.sort((a, b) => a.start - b.start);

    const merged: { start: number; end: number; title?: string }[] = [];
    for (const b of bookings) {
      if (merged.length === 0) {
        merged.push(b);
      } else {
        const last = merged[merged.length - 1];
        if (b.start < last.end) {
          last.end = Math.max(last.end, b.end);
        } else {
          merged.push(b);
        }
      }
    }

    const free = [];
    let current = dayStart.getTime();
    for (const b of merged) {
      if (b.start > current) {
        free.push({ start: current, end: b.start });
      }
      current = Math.max(current, b.end);
    }
    if (current < dayEnd.getTime()) {
      free.push({ start: current, end: dayEnd.getTime() });
    }

    return {
      booked: roomEvents.map(evt => ({
        title: evt.title,
        time: `${formatTime(new Date(evt.event_date))} - ${formatTime(new Date(evt.end_date))}`
      })),
      free: free.map(f => ({
        time: `${formatTime(new Date(f.start))} - ${formatTime(new Date(f.end))}`
      }))
    };
  };

  const getDaysList = () => {
    const list = [];
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    for (let i = 0; i < 10; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      list.push(d);
    }
    return list;
  };

  const openScheduleModal = (room: any) => {
    setSelectedRoomForSchedule(room);
    const initialDate = form.event_date ? new Date(form.event_date) : new Date();
    setSelectedScheduleDate(initialDate);
    setScheduleModalVisible(true);
  };

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

  const handlePublish = async () => {
    setIsLoading(true);
    if (!form.event_date || !form.end_date) {
      Alert.alert("Thông báo", "Vui lòng chọn thời gian bắt đầu và kết thúc trước!");
      setIsLoading(false);
      return;
    }
    if (!form.room_id) {
      Alert.alert("Thông báo", "Vui lòng chọn một phòng học trong danh sách!");
      setIsLoading(false);
      return;
    }
    if (!form.max_attendees) {
      Alert.alert("Thông báo", "Vui lòng nhập số lượng người tham gia (Capacity)!");
      setIsLoading(false);
      return;
    }
    if (form.event_date >= form.end_date) {
      setErrorMsg("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
      setIsLoading(false);
      return;
    }

    // Check capacity
    const selectedRoom = rooms.find((r) => r.id === form.room_id);
    if (selectedRoom && selectedRoom.capacity && form.max_attendees > selectedRoom.capacity) {
      Alert.alert(
        "Vượt quá sức chứa",
        `Phòng ${selectedRoom.name} chỉ có sức chứa tối đa là ${selectedRoom.capacity} người. Vui lòng giảm số lượng người tham gia hoặc chọn phòng khác.`
      );
      setIsLoading(false);
      return;
    }

    // Check conflict
    const conflict = allEvents.find((evt) => {
      if (evt.room_id !== form.room_id) return false;
      if (evt.status === "CANCELLED" || evt.status === "DRAFT") return false;
      const evtStart = new Date(evt.event_date).getTime();
      const evtEnd = new Date(evt.end_date).getTime();
      const formStart = new Date(form.event_date).getTime();
      const formEnd = new Date(form.end_date).getTime();
      return evtStart < formEnd && evtEnd > formStart;
    });

    if (conflict) {
      Alert.alert(
        "Lịch trùng lặp",
        `Phòng học ${conflict.room?.name || "đã chọn"} đã có sự kiện "${conflict.title}" đăng ký trong khung giờ từ ${new Date(conflict.event_date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${new Date(conflict.event_date).toLocaleDateString("vi-VN")} đến ${new Date(conflict.end_date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${new Date(conflict.end_date).toLocaleDateString("vi-VN")}. Vui lòng chọn phòng khác hoặc thay đổi thời gian.`
      );
      setIsLoading(false);
      return;
    }

    if (
      !form.title ||
      !form.end_date ||
      !form.event_date ||
      !form.max_attendees ||
      !form.location_url
    ) {
      Alert.alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      setIsLoading(false);
      return;
    }
    setErrorMsg("");

    form.host_id = (await getUserId()) ?? "";
    form.allowed_domain = "all";
    form.created_at = new Date().toISOString();
    form.form_config = JSON.stringify([]);
    form.banner_url = image;
    form.status = "PENDING";
    form.room_id = form.room_id || undefined;
    form.equipments = JSON.stringify(selectedEquipments);

    router.push({
      pathname: "/RegistrationFormScreen",
      params: {
        host_id: form.host_id,
        title: form.title,
        description: form.description || "",
        event_date: form.event_date,
        end_date: form.end_date,
        location_url: form.location_url,
        max_attendees: form.max_attendees,
        banner_url: form.banner_url || "",
        created_at: form.created_at,
        form_config: form.form_config,
        allowed_domain: form.allowed_domain,
        status: form.status,
        isCreate: "true",
        room_id: form.room_id || "",
        equipments: form.equipments || "{}",
        event_type: form.event_type || "",
        training_points: form.training_points ? String(form.training_points) : "",
        target_audience: form.target_audience || "",
        benefits: form.benefits || "",
      },
    });
    setIsLoading(false);
  };

  const handleDraft = async () => {
    setIsLoading(true);
    if (!form.event_date || !form.end_date) {
      Alert.alert("Thông báo", "Vui lòng chọn thời gian bắt đầu và kết thúc trước!");
      setIsLoading(false);
      return;
    }
    if (!form.room_id) {
      Alert.alert("Thông báo", "Vui lòng chọn một phòng học trong danh sách!");
      setIsLoading(false);
      return;
    }
    if (!form.max_attendees) {
      Alert.alert("Thông báo", "Vui lòng nhập số lượng người tham gia (Capacity)!");
      setIsLoading(false);
      return;
    }
    if (form.event_date >= form.end_date) {
      setErrorMsg("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
      setIsLoading(false);
      return;
    }

    // Check capacity
    const selectedRoom = rooms.find((r) => r.id === form.room_id);
    if (selectedRoom && selectedRoom.capacity && form.max_attendees > selectedRoom.capacity) {
      Alert.alert(
        "Vượt quá sức chứa",
        `Phòng ${selectedRoom.name} chỉ có sức chứa tối đa là ${selectedRoom.capacity} người. Vui lòng giảm số lượng người tham gia hoặc chọn phòng khác.`
      );
      setIsLoading(false);
      return;
    }

    // Check conflict
    const conflict = allEvents.find((evt) => {
      if (evt.room_id !== form.room_id) return false;
      if (evt.status === "CANCELLED" || evt.status === "DRAFT") return false;
      const evtStart = new Date(evt.event_date).getTime();
      const evtEnd = new Date(evt.end_date).getTime();
      const formStart = new Date(form.event_date).getTime();
      const formEnd = new Date(form.end_date).getTime();
      return evtStart < formEnd && evtEnd > formStart;
    });

    if (conflict) {
      Alert.alert(
        "Lịch trùng lặp",
        `Phòng học ${conflict.room?.name || "đã chọn"} đã có sự kiện "${conflict.title}" đăng ký trong khung giờ từ ${new Date(conflict.event_date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${new Date(conflict.event_date).toLocaleDateString("vi-VN")} đến ${new Date(conflict.end_date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${new Date(conflict.end_date).toLocaleDateString("vi-VN")}. Vui lòng chọn phòng khác hoặc thay đổi thời gian.`
      );
      setIsLoading(false);
      return;
    }

    if (
      !form.title ||
      !form.end_date ||
      !form.event_date ||
      !form.max_attendees ||
      !form.location_url
    ) {
      Alert.alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      setIsLoading(false);
      return;
    }
    setErrorMsg("");

    form.host_id = (await getUserId()) ?? "";
    form.allowed_domain = "all";
    form.created_at = new Date().toISOString();
    form.form_config = JSON.stringify([]);
    form.banner_url = image;
    form.status = "DRAFT";
    form.room_id = form.room_id || undefined;
    form.equipments = JSON.stringify(selectedEquipments);

    try {
      await EventService.createEvent(form);
      router.push("/HostDashBoardScreen");
    } catch (error: any) {
      console.log("Error creating draft event:", error);
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
                Select Room / Chọn phòng học (Bắt buộc)
              </CustomText>
              
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => {
                  setRoomSearchQuery("");
                  setRoomModalVisible(true);
                }}
              >
                <View style={styles.dropdownSelectorLeft}>
                  <Ionicons
                    name="home-outline"
                    size={18}
                    color={form.room_id ? Colors.color.primary : "#718096"}
                  />
                  <CustomText style={form.room_id ? styles.dropdownSelectorTextSelected : styles.dropdownSelectorTextPlaceholder}>
                    {form.room_id
                      ? `${rooms.find(r => r.id === form.room_id)?.name || ""} (Sức chứa: ${rooms.find(r => r.id === form.room_id)?.capacity || 0} người)`
                      : "Chọn phòng học..."}
                  </CustomText>
                </View>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color="#718096"
                />
              </TouchableOpacity>
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
                style={styles.btnSecondary}
                onPress={handleDraft}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <CustomText variant="bold" style={styles.btnSecondaryText}>
                    Lưu nháp
                  </CustomText>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handlePublish}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <CustomText variant="bold" style={styles.btnPrimaryText}>
                    Tiếp tục
                  </CustomText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={scheduleModalVisible}
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <CustomText variant="bold" style={styles.modalTitle}>
                Lịch đặt phòng {selectedRoomForSchedule?.name}
              </CustomText>
              <TouchableOpacity
                onPress={() => setScheduleModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Horizontal ScrollView of days */}
            <View style={styles.dateSelectorContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateScrollContent}
              >
                {getDaysList().map((day, idx) => {
                  const isDaySelected = selectedScheduleDate.toDateString() === day.toDateString();
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.dateChip,
                        isDaySelected && styles.dateChipSelected,
                      ]}
                      onPress={() => setSelectedScheduleDate(day)}
                    >
                      <CustomText
                        variant="medium"
                        style={[
                          styles.dateChipDayName,
                          isDaySelected && styles.dateChipTextSelected,
                        ]}
                      >
                        {getShortDayName(day)}
                      </CustomText>
                      <CustomText
                        variant="bold"
                        style={[
                          styles.dateChipDayNum,
                          isDaySelected && styles.dateChipTextSelected,
                        ]}
                      >
                        {day.getDate().toString().padStart(2, "0")}
                      </CustomText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Date Display */}
            <View style={styles.selectedDateTextContainer}>
              <CustomText variant="bold" style={styles.selectedDateText}>
                Ngày {selectedScheduleDate.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </CustomText>
            </View>

            {/* Scrollable schedule details */}
            <ScrollView style={styles.scheduleScroll} showsVerticalScrollIndicator={false}>
              {/* BOOKED SLOTS */}
              <View style={styles.scheduleSection}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="time-outline" size={18} color="#EF4444" />
                  <CustomText variant="bold" style={[styles.sectionTitle, { color: "#EF4444" }]}>
                    Khung giờ đã đặt
                  </CustomText>
                </View>
                {getScheduleForDate(selectedRoomForSchedule, selectedScheduleDate).booked.length > 0 ? (
                  getScheduleForDate(selectedRoomForSchedule, selectedScheduleDate).booked.map((slot, index) => (
                    <View key={index} style={styles.bookedSlotItem}>
                      <CustomText variant="bold" style={styles.slotTimeText}>
                        {slot.time}
                      </CustomText>
                      <CustomText style={styles.slotTitleText} numberOfLines={1}>
                        {slot.title}
                      </CustomText>
                    </View>
                  ))
                ) : (
                  <CustomText style={styles.emptyText}>Chưa có sự kiện nào đặt vào ngày này</CustomText>
                )}
              </View>

              {/* FREE SLOTS */}
              <View style={[styles.scheduleSection, { marginTop: 20 }]}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
                  <CustomText variant="bold" style={[styles.sectionTitle, { color: "#10B981" }]}>
                    Thời gian còn trống
                  </CustomText>
                </View>
                {getScheduleForDate(selectedRoomForSchedule, selectedScheduleDate).free.length > 0 ? (
                  getScheduleForDate(selectedRoomForSchedule, selectedScheduleDate).free.map((slot, index) => (
                    <View key={index} style={styles.freeSlotItem}>
                      <CustomText variant="bold" style={[styles.slotTimeText, { color: "#10B981" }]}>
                        {slot.time}
                      </CustomText>
                      <CustomText style={[styles.slotTitleText, { color: "#065F46" }]}>
                        Còn trống
                      </CustomText>
                    </View>
                  ))
                ) : (
                  <CustomText style={styles.emptyText}>Không còn thời gian trống trong ngày này</CustomText>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Room Selection Modal */}
      <Modal
        visible={roomModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRoomModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setRoomModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContainer, { height: "70%" }]}>
                <View style={styles.modalHeader}>
                  <CustomText variant="bold" style={styles.modalTitle}>
                    Chọn phòng học / Select Room
                  </CustomText>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setRoomModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#4A5568" />
                  </TouchableOpacity>
                </View>

                <View style={styles.dropdownSearchWrapper}>
                  <Ionicons name="search" size={18} color="#A0AEC0" />
                  <TextInput
                    style={styles.dropdownSearchInput}
                    placeholder="Tìm kiếm phòng..."
                    placeholderTextColor="#A0AEC0"
                    value={roomSearchQuery}
                    onChangeText={setRoomSearchQuery}
                  />
                  {roomSearchQuery ? (
                    <TouchableOpacity onPress={() => setRoomSearchQuery("")}>
                      <Ionicons name="close-circle" size={18} color="#A0AEC0" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 30 }}
                >
                  {filteredRooms.length === 0 ? (
                    <CustomText style={styles.emptyRoomsText}>Không tìm thấy phòng học nào</CustomText>
                  ) : (
                    filteredRooms.map((room) => {
                      const isSelected = form.room_id === room.id;
                      return (
                        <View key={room.id} style={[styles.dropdownRoomItem, isSelected && styles.dropdownRoomItemSelected]}>
                          <TouchableOpacity
                            style={styles.dropdownRoomItemLeft}
                            onPress={() => {
                              setForm({
                                ...form,
                                room_id: room.id,
                                location_url: room.name,
                              });
                              setRoomModalVisible(false);
                            }}
                          >
                            <Ionicons
                              name="home-outline"
                              size={18}
                              color={isSelected ? Colors.color.primary : "#718096"}
                            />
                            <View style={styles.dropdownRoomInfo}>
                              <CustomText variant="bold" style={[styles.dropdownRoomItemName, isSelected && styles.dropdownRoomItemNameSelected]}>
                                {room.name}
                              </CustomText>
                              {room.capacity && (
                                <CustomText style={styles.dropdownRoomItemCapacity}>
                                  Sức chứa: {room.capacity} người
                                </CustomText>
                              )}
                            </View>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={styles.roomScheduleBtnCompact}
                            onPress={() => openScheduleModal(room)}
                          >
                            <Ionicons name="calendar-outline" size={12} color={Colors.color.primary} style={{ marginRight: 4 }} />
                            <CustomText style={styles.roomScheduleBtnText}>Xem lịch</CustomText>
                          </TouchableOpacity>
                        </View>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    btnPrimary: {
      flex: 1.5,
      backgroundColor: Colors.color.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    btnSecondary: {
      flex: 1,
      borderWidth: 1,
      borderColor: Colors.color.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      marginRight: 10,
    },
    btnPrimaryText: {
      color: "white",
      fontSize: 16,
    },
    btnSecondaryText: {
      color: Colors.color.primary,
      fontSize: 16,
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
    roomListContainer: {
      gap: 10,
      marginVertical: 10,
    },
    roomItemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#F5F7FA",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    roomItemRowSelected: {
      borderColor: Colors.color.primary,
      backgroundColor: "#EBF8FF",
    },
    roomItemLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    roomInfo: {
      flex: 1,
    },
    roomItemName: {
      fontSize: 15,
      color: "#2D3748",
    },
    roomItemNameSelected: {
      color: Colors.color.primary,
    },
    roomItemCapacity: {
      fontSize: 12,
      color: "#718096",
      marginTop: 2,
    },
    roomScheduleBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: "#FFF",
      borderWidth: 1,
      borderColor: Colors.color.primary,
    },
    roomScheduleBtnText: {
      fontSize: 12,
      color: Colors.color.primary,
      fontWeight: "bold",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: "white",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    modalTitle: {
      fontSize: 18,
      color: "#1a2a44",
    },
    modalCloseBtn: {
      padding: 4,
    },
    dateSelectorContainer: {
      marginBottom: 15,
    },
    dateScrollContent: {
      gap: 10,
      paddingRight: 20,
    },
    dateChip: {
      width: 55,
      height: 65,
      borderRadius: 12,
      backgroundColor: "#F7FAFC",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
    },
    dateChipSelected: {
      backgroundColor: Colors.color.primary,
      borderColor: Colors.color.primary,
    },
    dateChipDayName: {
      fontSize: 11,
      color: "#718096",
    },
    dateChipDayNum: {
      fontSize: 16,
      color: "#2D3748",
    },
    dateChipTextSelected: {
      color: "#FFF",
    },
    selectedDateTextContainer: {
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#EDF2F7",
      paddingBottom: 10,
    },
    selectedDateText: {
      fontSize: 14,
      color: "#4A5568",
    },
    scheduleScroll: {
      flexGrow: 1,
    },
    scheduleSection: {
      backgroundColor: "#F7FAFC",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: "#EDF2F7",
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 14,
    },
    bookedSlotItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#FFF",
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#FEE2E2",
      marginBottom: 8,
    },
    slotTimeText: {
      fontSize: 13,
      color: "#EF4444",
    },
    slotTitleText: {
      fontSize: 13,
      color: "#4A5568",
      flex: 1,
      marginLeft: 15,
      textAlign: "right",
    },
    emptyText: {
      fontSize: 12,
      color: "#A0AEC0",
      fontStyle: "italic",
      textAlign: "center",
      paddingVertical: 10,
    },
    freeSlotItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#FFF",
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#D1FAE5",
      marginBottom: 8,
    },
    dropdownSelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#F5F7FA",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginTop: 8,
      marginBottom: 10,
    },
    dropdownSelectorLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    dropdownSelectorTextPlaceholder: {
      fontSize: 14,
      color: "#A0AEC0",
    },
    dropdownSelectorTextSelected: {
      fontSize: 14,
      color: "#1a2a44",
      fontWeight: "bold",
    },
    dropdownListContainer: {
      backgroundColor: "#FFF",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#E2E8F0",
      padding: 8,
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    dropdownSearchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F5F7FA",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginBottom: 10,
      gap: 8,
    },
    dropdownSearchInput: {
      flex: 1,
      fontSize: 13,
      color: "#2D3748",
      padding: 0,
    },
    dropdownRoomItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#F7FAFC",
    },
    dropdownRoomItemSelected: {
      backgroundColor: "#EBF8FF",
    },
    dropdownRoomItemLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    dropdownRoomInfo: {
      flex: 1,
    },
    dropdownRoomItemName: {
      fontSize: 14,
      color: "#2D3748",
    },
    dropdownRoomItemNameSelected: {
      color: Colors.color.primary,
      fontWeight: "bold",
    },
    dropdownRoomItemCapacity: {
      fontSize: 11,
      color: "#718096",
      marginTop: 1,
    },
    emptyRoomsText: {
      textAlign: "center",
      color: "#A0AEC0",
      paddingVertical: 15,
      fontSize: 13,
    },
    roomScheduleBtnCompact: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      backgroundColor: "#FFF",
      borderWidth: 1,
      borderColor: Colors.color.primary,
    },
  });
}