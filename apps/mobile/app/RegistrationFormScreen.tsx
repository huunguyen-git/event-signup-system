import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { getUserId } from "@/services/storage";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { Colors } from "../constants/theme";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { EventService } from "@/axios/eventService";
import * as Notifications from "expo-notifications";
import { NotificationService } from "@/axios/notificationService";
import { SchedulableTriggerInputTypes } from "expo-notifications";

export default function RegistrationFormScreen() {
  const router = useRouter();
  const themeColor = Colors.light.tint;

  const [agreed, setAgreed] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [ticketType, setTicketType] = useState("Standard Pass");
  const [isLoading, setIsLoading] = useState(false);

  const [showTicketPicker, setShowTicketPicker] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCustomQuestionModal, setShowCustomQuestionModal] = useState(false);
  const {
    id,
    host_id,
    title,
    description,
    event_date,
    end_date,
    location_url,
    max_attendees,
    banner_url,
    created_at,
    form_config,
    allowed_domain,
    status,
    isCreate,
  } = useLocalSearchParams();
  const [data, setData] = useState<ICreateEvent>(new ICreateEvent());
  const [customQuestions, setCustomQuestions] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const IsCreate = isCreate === "true" ? true : false;
  useEffect(() => {
    const fetchData = async () => {
      if (IsCreate) {
        setData({
          ...data,
          host_id: host_id as string,
          title: title as string,
          description: description as string,
          event_date: event_date as string,
          end_date: end_date as string,
          location_url: location_url as string,
          max_attendees: parseInt(max_attendees as string),
          banner_url: banner_url as string,
          created_at: created_at as string,
          allowed_domain: allowed_domain as string,
          status: status as string,
          form_config: form_config as string,
        });
      } else {
        const event = await EventService.getEvent(id);
        console.log("event duoc lay ve:", event);
        setData(event);
        const formConfig = event.form_config
          ? JSON.parse(event.form_config)
          : [];
        if (Array.isArray(formConfig)) {
          setCustomQuestions(formConfig);
        }
      }
    };
    fetchData();
  }, []);

  const handleSaveCustomQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      question: question,
    };
    const updatedQuestions = [...customQuestions, newQuestion];
    setCustomQuestions(updatedQuestions);
    setData({
      ...data,
      form_config: JSON.stringify(updatedQuestions),
    });
    setShowCustomQuestionModal(false);
    setQuestion("");
  };

  const handleCancelCustomQuestion = () => {
    setShowCustomQuestionModal(false);
    setQuestion("");
  };
  const handleCreateEvent = async () => {
    try {
      setIsLoading(true);
      await EventService.createEvent(data);
      const notification = {
        userId: await getUserId(),
        title: data.title,
        body: "Bạn vừa đăng kí sự kiện " + data.title,
      };
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: { eventId: data.id },
        },
        trigger: null,
      });
      await NotificationService.sendAndSaveNotification(notification);
      router.push("/HostDashBoardScreen");
      setIsLoading(false);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };
  const handleRegisterEvent = async () => {
    try {
      setIsLoading(true);
      const currentUserId = await getUserId();
      if (!currentUserId) {
        return;
      }
      const applicationData = {
        event_id: id as string,
        user_id: currentUserId,
        answers: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          jobTitle: jobTitle,
          ticketType: ticketType,
        },
      };
      console.log(
        "Đang gửi đơn đăng ký sự kiện lên server...",
        applicationData,
      );
      const result = await EventService.registerForEvent(applicationData);
      if (result.status === "WAITLISTED") {
          Alert.alert(
              "Sự kiện đã đầy!",
              "Bạn đã được đưa vào danh sách chờ. Chúng tôi sẽ thông báo nếu có người hủy vé."
          );
          router.back();
      } else {
          router.replace({
              pathname: "/SuccessScreen",
              params: { ticketType: ticketType },
          });
      }
      scheduleEventReminder(data.title, data.event_date);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert("Đăng ký thất bại", error.message);
    }
  };

  async function scheduleEventReminder(
    eventTitle: string,
    eventStartStr: string,
  ) {
    const eventTime = new Date(data.event_date).getTime();
    const triggerDate = new Date(eventTime - 30 * 60 * 1000);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Sắp diễn ra: ${eventTitle}`,
        body: "Sự kiện của bạn sẽ bắt đầu sau 30 phút nữa. Hãy chuẩn bị nhé!",
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }
  const ticketOptions = [
    { id: "1", name: "Standard Pass" },
    { id: "2", name: "Premium Pass" },
  ];

  const InputField = ({
    label,
    placeholder,
    isShort,
    value,
    onChangeText,
  }: any) => (
    <View style={[styles.inputGroup, isShort && { flex: 1 }]}>
      <CustomText variant="bold" style={styles.label}>
        {label}
      </CustomText>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, isCreate && { opacity: 0.5 }]}
          placeholder={placeholder}
          placeholderTextColor="#bbb"
          value={value}
          onChangeText={onChangeText}
          editable={!IsCreate}
        />
      </View>
    </View>
  );

  const InfoModal = ({ visible, title, content, onClose }: any) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.infoOverlay}>
        <View style={styles.infoCard}>
          <CustomText variant="bold" style={styles.infoTitle}>
            {title}
          </CustomText>
          <ScrollView style={{ maxHeight: 250 }}>
            <CustomText style={styles.infoBodyText}>{content}</CustomText>
          </ScrollView>
          <TouchableOpacity
            style={[styles.infoCloseBtn, { backgroundColor: themeColor }]}
            onPress={onClose}
          >
            <CustomText variant="bold" style={styles.infoCloseBtnText}>
              ĐÓNG
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.overlayContainer}
    >
      <TouchableOpacity
        style={styles.dismissArea}
        activeOpacity={1}
        onPressOut={() => router.back()}
      />
      {IsCreate && (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.floatingAddBtn}
          onPress={() => setShowCustomQuestionModal(true)}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      <Modal
        visible={showCustomQuestionModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.questionCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="create-outline" size={22} color={themeColor} />
              <CustomText variant="bold" style={styles.cardTitle}>
                Thêm câu hỏi mới
              </CustomText>
            </View>

            <CustomText style={styles.cardSubtitle}>
              Nội dung này sẽ xuất hiện trong form đăng ký của người tham gia.
            </CustomText>

            <View style={styles.textAreaWrapper}>
              <TextInput
                value={question}
                style={styles.textArea}
                onChangeText={(text) => setQuestion(text)}
                placeholder="VD: Bạn có chế độ ăn kiêng đặc biệt nào không?"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={handleCancelCustomQuestion}
              >
                <CustomText variant="medium" style={styles.secondaryBtnText}>
                  HỦY
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: themeColor }]}
                onPress={handleSaveCustomQuestion}
              >
                <CustomText variant="bold" style={styles.primaryBtnText}>
                  LƯU CÂU HỎI
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.scrollDismissArea}
          activeOpacity={1}
          onPress={() => router.back()}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalCard}>
              <CustomText style={styles.eventSmallTitle}>
                International Tech Summit 2024
              </CustomText>
              <CustomText
                variant="bold"
                style={[styles.mainTitle, { color: themeColor }]}
              >
                CONFIRM REGISTRATION
              </CustomText>

              {!IsCreate && (
                <View style={styles.ticketSummary}>
                  <View>
                    <CustomText variant="bold" style={styles.ticketLabel}>
                      REGISTERING AS:
                    </CustomText>
                    <CustomText variant="bold" style={styles.ticketType}>
                      {ticketType}
                    </CustomText>
                  </View>
                  <TouchableOpacity onPress={() => setShowTicketPicker(true)}>
                    <CustomText
                      variant="bold"
                      style={[styles.changeLink, { color: themeColor }]}
                    >
                      Change
                    </CustomText>
                  </TouchableOpacity>
                </View>
              )}

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 300 }}
              >
                <View style={styles.row}>
                  <InputField
                    label="First Name"
                    placeholder="A"
                    isShort
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                  <View style={{ width: 10 }} />
                  <InputField
                    label="Last Name"
                    placeholder="Nguyễn Văn"
                    isShort
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
                <InputField
                  label="Company Email"
                  placeholder="nguyenvana@gm.uit.edu.vn"
                  value={email}
                  onChangeText={setEmail}
                />
                <InputField
                  label="Job Title"
                  placeholder="Software Engineer"
                  value={jobTitle}
                  onChangeText={setJobTitle}
                />
                {customQuestions.map((q) => (
                  <InputField
                    key={q.id}
                    label={q.question}
                    placeholder="Your answer here..."
                  />
                ))}

                {!IsCreate && (
                  <View style={styles.checkboxRow}>
                    <TouchableOpacity onPress={() => setAgreed(!agreed)}>
                      <MaterialCommunityIcons
                        name={agreed ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={24}
                        color={themeColor}
                      />
                    </TouchableOpacity>
                    <CustomText style={styles.checkboxText}>
                      I agree to the{" "}
                      <CustomText
                        variant="bold"
                        style={styles.boldLink}
                        onPress={() => setShowTerms(true)}
                      >
                        Terms of Service
                      </CustomText>{" "}
                      and{" "}
                      <CustomText
                        variant="bold"
                        style={styles.boldLink}
                        onPress={() => setShowPrivacy(true)}
                      >
                        Privacy Policy
                      </CustomText>
                      .
                    </CustomText>
                  </View>
                )}
              </ScrollView>

              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => router.back()}
                >
                  <CustomText
                    variant="bold"
                    style={[styles.cancelBtnText, { color: themeColor }]}
                  >
                    CANCEL
                  </CustomText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.completeBtn,
                    {
                      backgroundColor: themeColor,
                      opacity: isCreate ? 1 : agreed ? 1 : 0.5,
                    },
                  ]}
                  disabled={IsCreate ? false : !agreed}
                  onPress={IsCreate ? handleCreateEvent : handleRegisterEvent}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <CustomText variant="bold" style={styles.completeBtnText}>
                      {IsCreate ? "SAVE" : "COMPLETE REGISTRATION"}
                    </CustomText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showTicketPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <CustomText variant="bold" style={styles.pickerHeader}>
              Select Ticket Type
            </CustomText>
            {ticketOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  ticketType === option.name && {
                    borderColor: themeColor,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => {
                  setTicketType(option.name);
                  setShowTicketPicker(false);
                }}
              >
                <CustomText
                  variant="bold"
                  style={[
                    styles.optionName,
                    ticketType === option.name && { color: themeColor },
                  ]}
                >
                  {option.name}
                </CustomText>
                {ticketType === option.name && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={themeColor}
                  />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerClose}
              onPress={() => setShowTicketPicker(false)}
            >
              <CustomText variant="bold" style={{ color: "#999" }}>
                QUAY LẠI
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <InfoModal
        visible={showTerms}
        title="Terms of Service"
        content="Nội dung điều khoản dịch vụ chi tiết ở đây..."
        onClose={() => setShowTerms(false)}
      />
      <InfoModal
        visible={showPrivacy}
        title="Privacy Policy"
        content="Nội dung chính sách bảo mật chi tiết ở đây..."
        onClose={() => setShowPrivacy(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    padding: 20,
  },
  questionCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    color: "#1A1A1A",
    marginLeft: 8,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#777",
    lineHeight: 18,
    marginBottom: 20,
  },
  textAreaWrapper: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 25,
  },
  textArea: {
    fontSize: 15,
    color: "#333",
    height: 100,
    textAlignVertical: "top",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 8,
  },
  secondaryBtnText: {
    color: "#999",
    fontSize: 14,
  },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 14,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  scrollDismissArea: {
    flex: 1,
    justifyContent: "center",
  },
  dismissArea: { ...StyleSheet.absoluteFillObject },
  floatingAddBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 25,
    elevation: 20,
  },
  eventSmallTitle: { fontSize: 13, color: "#666", textAlign: "center" },
  mainTitle: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 15,
  },
  ticketSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F1F3F5",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  ticketLabel: { fontSize: 11, color: "#777" },
  ticketType: { fontSize: 15, color: "#333" },
  changeLink: {
    textDecorationLine: "underline",
    fontSize: 13,
  },
  row: { flexDirection: "row" },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 12, color: "#444", marginBottom: 5 },
  inputWrapper: {
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F4F6F9",
  },
  input: { paddingVertical: 10, fontSize: 15, color: "#000" },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 15,
  },
  checkboxText: { marginLeft: 8, fontSize: 12, color: "#666", flex: 1 },
  boldLink: {
    textDecorationLine: "underline",
    color: "#333",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    marginRight: 10,
    borderRadius: 25,
    backgroundColor: "#F1F3F5",
    justifyContent: "center",
  },
  cancelBtnText: { fontSize: 15 },
  completeBtn: {
    flex: 2,
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  completeBtnText: {
    color: "white",
    fontSize: 15,
    textAlign: "center",
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
  },
  pickerHeader: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  optionName: { fontSize: 16, color: "#333" },
  pickerClose: { padding: 15, alignItems: "center" },
  infoOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 30,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
  },
  infoTitle: { fontSize: 18, marginBottom: 15 },
  infoBodyText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    textAlign: "center",
  },
  infoCloseBtn: {
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  infoCloseBtnText: { color: "white" },
});
