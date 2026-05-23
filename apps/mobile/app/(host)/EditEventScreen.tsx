import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import * as ImagePicker from "expo-image-picker";
import { ICreateEvent } from "../../axios/dto/eventModel";
import { EventService } from "../../axios/eventService";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function EditEventScreen() {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [status, setStatus] = useState("LIVE");
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<ICreateEvent>(new ICreateEvent());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router =useRouter();
  useEffect(() => {
    const fetchData = async () => {
      const data = await EventService.getEvent(id);
      setEvent(data);
    };
    fetchData();
  }, [id]);
  const statusOptions = [
    { label: "PUBLISHED", color: "#4CAF50" },
    { label: "DRAFT", color: "#FFC107" },
    { label: "COMPLETE", color: "#2196F3" },
  ];

  const selectStatus = (val: string) => {
    setStatus(val);
    setIsStatusOpen(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [6, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setEvent({ ...event, banner_url: result.assets[0].uri });
    }
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    await EventService.updateEvent(event.id, event);
    Alert.alert("Đăng kí sự kiên thành công");
    router.push("/HostDashBoardScreen");
    setIsLoading(false);
  };

  const handleCancel = () => {
    setIsLoading(true);
    router.push("/HostDashBoardScreen");
    setIsLoading(false);
  };

  const styles = createStyles();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.mainContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerActionBtn}>
          <Ionicons name="close-outline" size={24} color="#BBB" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <CustomText variant="bold" style={styles.headerSubtitle}>Editing Event</CustomText>
          <CustomText variant="bold" style={styles.headerMainTitle} numberOfLines={1}>
            {event.title}
          </CustomText>
        </View>

        <TouchableOpacity
          onPress={handleSaveChanges}
          style={styles.headerSaveBtn}
        >
          {isLoading ? (<ActivityIndicator size="small" color="#ffffff" />) : (<CustomText variant="bold" style={styles.saveBtnText}>Save</CustomText>)}
          
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/*  EVENT STATUS */}
        <View style={styles.card}>
          <CustomText variant="bold" style={styles.cardSectionTitle}>EVENT STATUS</CustomText>

          {/* DROPDOWN TRIGGER */}
          <TouchableOpacity
            style={styles.statusSelectorRow}
            onPress={() => setIsStatusOpen(!isStatusOpen)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: statusOptions.find(
                      (o) => o.label === status,
                    )?.color,
                  },
                ]}
              />
              <CustomText variant="medium" style={styles.selectorMainText}>{status}</CustomText>
            </View>
            <Ionicons
              name={isStatusOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {/* THE DROPDOWN MENU */}
          {isStatusOpen && (
            <View style={styles.dropdownMenu}>
              {statusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={styles.dropdownItem}
                  onPress={() => selectStatus(opt.label)}
                >
                  <View
                    style={[styles.statusDot, { backgroundColor: opt.color }]}
                  />
                  <CustomText
                    variant={status === opt.label ? "bold" : "regular"}
                    style={[
                      styles.dropdownItemText,
                      status === opt.label && {
                        color: "#1a2a44",
                      },
                    ]}
                  >
                    {opt.label}
                  </CustomText>
                  {status === opt.label && (
                    <Ionicons name="checkmark" size={18} color="#1a2a44" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* EVENT INFORMATION */}
        <View style={styles.card}>
          <CustomText variant="bold" style={styles.cardSectionTitle}>EVENT INFORMATION</CustomText>

          <CustomText variant="medium" style={styles.label}>Event Title</CustomText>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.wrapperInput}
              value={event.title}
              onChangeText={(val) => setEvent({ ...event, title: val })}
            />
          </View>

          <CustomText variant="medium" style={styles.label}>Event Image (6:9)</CustomText>
          <TouchableOpacity
            style={[
              styles.imageContainer,
              event.banner_url && styles.imageActive,
            ]}
            onPress={pickImage}
          >
            {event.banner_url ? (
              <Image
                source={{ uri: event.banner_url }}
                style={styles.previewImage}
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={styles.cameraCircle}>
                  <Ionicons name="camera-outline" size={24} color="#FFF" />
                </View>
                <CustomText variant="medium" style={styles.uploadMainText}>Tap to add</CustomText>
                <CustomText style={styles.uploadSubText}>Recommended (6:9)</CustomText>
              </View>
            )}
          </TouchableOpacity>

          {/* DESCRIPTION */}
          <CustomText variant="medium" style={styles.label}>Description</CustomText>
          <View
            style={[
              styles.inputWrapper,
              { height: 120, alignItems: "flex-start", paddingVertical: 10 },
            ]}
          >
            <TextInput
              style={[styles.wrapperInput, styles.textAreaInput]}
              multiline
              numberOfLines={4}
              value={event.description}
              onChangeText={(val) => setEvent({ ...event, description: val })}
            />
          </View>
        </View>

        {/* DATE & VENUE */}
        <View style={styles.card}>
          <CustomText variant="bold" style={styles.cardSectionTitle}>DATE & VENUE</CustomText>
          <View style={styles.selectorRow}>
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
                {event.event_date ? new Date(event.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Start Date"}
              </CustomText>
            </TouchableOpacity>

            {/* Nút chọn End Date */}
            <TouchableOpacity
              style={styles.dateTimeSelector}
              onPress={() => setShowEndPicker(true)}
            >
              <Ionicons name="time-outline" size={18} color="#1a2a44" />
              <CustomText variant="medium" style={styles.selectorMainText}>
                {event.end_date ? new Date(event.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "End Date"}
              </CustomText>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="calendar"
                onChange={(date, selectedDate) => {
                  setShowStartPicker(false);
                  if (selectedDate) {
                    setEvent({
                      ...event,
                      event_date: selectedDate.toISOString(),
                    });
                  }
                }}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="calendar"
                onChange={(date, selectedDate) => {
                  setShowEndPicker(false);
                  if (selectedDate) {
                    setEvent({
                      ...event,
                      end_date: selectedDate.toISOString(),
                    });
                  }
                }}
              />
            )}
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.wrapperInput}
            value={event.location_url}
            onChangeText={(val) => setEvent({ ...event, location_url: val })}
          />
        </View>

        {/* CAPACITY & PRICE */}
        <View style={styles.card}>
          <CustomText variant="bold" style={styles.cardSectionTitle}>CAPACITY & TICKETING</CustomText>
          <View style={styles.ticketRow}>
            <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
              <TextInput
                style={styles.wrapperInput}
                keyboardType="numeric"
                value={String(event.max_attendees)}
                onChangeText={(val) =>
                  setEvent({ ...event, max_attendees: Number(val) })
                }
              />
            </View>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <CustomText
                variant="bold"
                style={{ fontSize: 16, color: "#1a2a44" }}
              >
                $
              </CustomText>
              <TextInput
                style={[styles.wrapperInput, { marginLeft: 5 }]}
                keyboardType="numeric"
                value="20"
              />
            </View>
          </View>
        </View>
      </ScrollView>
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
      flexDirection: "row",
      backgroundColor: Colors.color.primary,
      paddingTop: Platform.OS === "ios" ? 50 : 20,
      paddingBottom: 20,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    headerActionBtn: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 10,
    },
    headerSubtitle: {
      color: "#BBB",
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    headerMainTitle: {
      color: "white",
      fontSize: 16,
    },
    headerSaveBtn: {
      backgroundColor: "rgba(255,255,255,0.15)",
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 10,
    },
    saveBtnText: {
      color: "white",
      fontSize: 14,
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
    selectorRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    dateTimeSelector: {
      flex: 0.48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F5F7FA",
      padding: 14,
      borderRadius: 10,
    },
    ticketRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statusSelectorRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#F5F7FA",
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#E6E9EE",
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 10,
    },
    selectorMainText: {
      marginLeft: 8,
      fontSize: 14,
      color: "#1a2a44",
    },

    // DROPDOWN MENU STYLES
    dropdownMenu: {
      backgroundColor: "#FFF",
      marginTop: 5,
      borderRadius: 12,
      padding: 5,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: { elevation: 5 },
      }),
      borderWidth: 1,
      borderColor: "#EEE",
    },
    dropdownItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      borderRadius: 8,
    },
    dropdownItemText: {
      flex: 1,
      fontSize: 14,
      color: "#666",
    },
  });
}
