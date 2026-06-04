import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Colors } from "../../../constants/theme";
import Header from "@/components/Header";
import { EventService } from "@/axios/eventService";
import { ClubRequestService } from "@/axios/clubRequestService";
import { getToken } from "@/services/storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import apiClient from "@/axios/axios";
import { NotificationService } from "@/axios/notificationService";
import { getSocket } from "@/services/socket";

export default function ApproveEventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<{ [key: string]: string }>({});
  
  // Club Request States
  const [activeTab, setActiveTab] = useState<"EVENTS" | "CLUBS">("EVENTS");
  const [clubRequests, setClubRequests] = useState<any[]>([]);
  const [clubLoading, setClubLoading] = useState(false);
  const [rejectType, setRejectType] = useState<"EVENT" | "CLUB">("EVENT");
  
  // Rejection modal states
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState<string>("");
  const [selectedEventHostId, setSelectedEventHostId] = useState<string>("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await EventService.getEvents();
      const pending = allEvents.filter((item: any) => item.status?.toUpperCase() === "PENDING");
      setEvents(pending);
    } catch (err) {
      console.log("Error fetching pending events:", err);
      Alert.alert("Lỗi", "Không thể lấy danh sách sự kiện chờ duyệt.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClubRequests = async () => {
    try {
      setClubLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await ClubRequestService.getAllRequests(token);
      const pending = data.filter((item: any) => item.status?.toUpperCase() === "PENDING");
      setClubRequests(pending);
    } catch (err) {
      console.log("Error fetching club requests:", err);
      Alert.alert("Lỗi", "Không thể lấy danh sách yêu cầu CLB.");
    } finally {
      setClubLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPendingEvents();
      fetchClubRequests();
    }, [])
  );

  useEffect(() => {
    const socket = getSocket();
    
    socket.on("events_changed", fetchPendingEvents);
    socket.on("club_requests_changed", fetchClubRequests);
    
    return () => {
      socket.off("events_changed", fetchPendingEvents);
      socket.off("club_requests_changed", fetchClubRequests);
    };
  }, []);

  const handleApprove = async (id: string, title: string, hostId: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      await EventService.approveEvent(token, id);
      Alert.alert("Thành công", `Đã phê duyệt sự kiện "${title}".`);
      fetchPendingEvents();
    } catch (err: any) {
      console.log("Error approving event:", err);
      Alert.alert("Lỗi", err.response?.data?.message || "Phê duyệt sự kiện thất bại.");
    }
  };

  const openRejectModal = (id: string, title: string, hostId: string) => {
    setSelectedEventId(id);
    setSelectedEventTitle(title);
    setSelectedEventHostId(hostId);
    setRejectReason("");
    setRejectType("EVENT");
    setRejectModalVisible(true);
  };

  const handleApproveClub = async (id: string, name: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      await ClubRequestService.approveRequest(token, id);
      Alert.alert("Thành công", `Đã phê duyệt yêu cầu lên CLB cho "${name}".`);
      fetchClubRequests();
    } catch (err: any) {
      console.log("Error approving club request:", err);
      Alert.alert("Lỗi", err.response?.data?.message || "Phê duyệt yêu cầu thất bại.");
    }
  };

  const openClubRejectModal = (id: string, name: string) => {
    setSelectedEventId(id);
    setSelectedEventTitle(name);
    setRejectReason("");
    setRejectType("CLUB");
    setRejectModalVisible(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      setRejecting(true);
      const token = await getToken();
      if (!token) return;

      if (rejectType === "EVENT") {
        // 1. Cancel/Reject event in DB
        await apiClient.patch(
          `/events/${selectedEventId}/cancel`,
          { reason: rejectReason },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 2. Notify the host about the rejection
        await NotificationService.sendAndSaveNotification({
          userId: selectedEventHostId,
          title: `Sự kiện bị từ chối: ${selectedEventTitle}`,
          body: `Lý do: ${rejectReason}`,
        });

        Alert.alert("Thành công", `Đã từ chối sự kiện "${selectedEventTitle}" và gửi lý do cho người tổ chức.`);
        fetchPendingEvents();
      } else {
        // Reject club request
        await ClubRequestService.rejectRequest(token, selectedEventId!, rejectReason);
        Alert.alert("Thành công", `Đã từ chối đơn đăng ký CLB của "${selectedEventTitle}".`);
        fetchClubRequests();
      }
      setRejectModalVisible(false);
    } catch (err: any) {
      console.log("Error rejecting:", err);
      Alert.alert("Lỗi", "Từ chối thất bại.");
    } finally {
      setRejecting(false);
    }
  };

  const formatEventDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "N/A";
      const datePart = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
      const timePart = new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d);
      return `${datePart} - ${timePart}`;
    } catch (e) {
      return "N/A";
    }
  };

  const renderEventItem = ({ item }: { item: any }) => {
    const bannerSource = item.banner_url
      ? { uri: item.banner_url }
      : require("../../../assets/images/icon.png");

    return (
      <View style={styles.card}>
        <View style={styles.cardMain}>
          <Image source={bannerSource} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.infoContainer}>
            <View style={styles.pendingBadge}>
              <CustomText variant="bold" style={styles.pendingText}>
                PENDING APPROVAL
              </CustomText>
            </View>
            <CustomText variant="bold" style={styles.title} numberOfLines={2}>
              {item.title}
            </CustomText>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
              <CustomText style={styles.detailText}>{formatEventDate(item.event_date)}</CustomText>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
              <CustomText style={styles.detailText} numberOfLines={1}>
                {item.location_url || "N/A"}
              </CustomText>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="door-open" size={14} color="#6B7280" style={{ marginRight: 6 }} />
              <CustomText style={styles.detailText}>
                Phòng đăng ký: {item.room?.name || "N/A"}
              </CustomText>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
              <CustomText style={styles.detailText}>
                Host: {item.host?.full_name || "N/A"}
              </CustomText>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => openRejectModal(item.id, item.title, item.host_id)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <CustomText variant="bold" style={styles.rejectBtnText}>
              Từ chối
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => handleApprove(item.id, item.title, item.host_id)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <CustomText variant="bold" style={styles.approveBtnText}>
              Duyệt
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderClubItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardMain}>
          <View style={styles.avatarFallbackSmall}>
            <CustomText variant="bold" style={styles.avatarInitialSmall}>
              {item.club_name?.charAt(0).toUpperCase() || "?"}
            </CustomText>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.pendingBadgeClub}>
              <CustomText variant="bold" style={styles.pendingTextClub}>
                YÊU CẦU LÊN CLB
              </CustomText>
            </View>
            <CustomText variant="bold" style={styles.title} numberOfLines={1}>
              {item.club_name}
            </CustomText>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
              <CustomText style={styles.detailText} numberOfLines={1}>
                Người gửi: {item.user?.full_name || "N/A"}
              </CustomText>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
              <CustomText style={styles.detailText} numberOfLines={1}>
                Email: {item.user?.email || "N/A"}
              </CustomText>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
              <CustomText style={styles.detailText} numberOfLines={3}>
                Lý do: {item.description || "N/A"}
              </CustomText>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => openClubRejectModal(item.id, item.club_name)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <CustomText variant="bold" style={styles.rejectBtnText}>
              Từ chối
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => handleApproveClub(item.id, item.club_name)}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <CustomText variant="bold" style={styles.approveBtnText}>
              Duyệt
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Header />
      
      <View style={styles.screenHeader}>
        <CustomText variant="bold" style={styles.screenTitle}>
          APPROVE DASHBOARD
        </CustomText>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "EVENTS" && styles.activeTabButton]}
          onPress={() => setActiveTab("EVENTS")}
        >
          <CustomText
            variant="bold"
            style={[styles.tabText, activeTab === "EVENTS" && styles.activeTabText]}
          >
            Sự kiện ({events.length})
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "CLUBS" && styles.activeTabButton]}
          onPress={() => setActiveTab("CLUBS")}
        >
          <CustomText
            variant="bold"
            style={[styles.tabText, activeTab === "CLUBS" && styles.activeTabText]}
          >
            Yêu cầu CLB ({clubRequests.length})
          </CustomText>
        </TouchableOpacity>
      </View>

      {activeTab === "EVENTS" ? (
        loading ? (
          <ActivityIndicator size="large" color={Colors.color.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={renderEventItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="sticker-check-outline" size={60} color="#9CA3AF" />
                <CustomText style={styles.emptyText}>
                  Không có sự kiện nào đang chờ duyệt.
                </CustomText>
              </View>
            }
          />
        )
      ) : (
        clubLoading ? (
          <ActivityIndicator size="large" color={Colors.color.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={clubRequests}
            keyExtractor={(item) => item.id}
            renderItem={renderClubItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="shield-check-outline" size={60} color="#9CA3AF" />
                <CustomText style={styles.emptyText}>
                  Không có yêu cầu nâng cấp CLB nào đang chờ duyệt.
                </CustomText>
              </View>
            }
          />
        )
      )}

      {/* Reject Reason Modal */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "100%", alignItems: "center" }}
            >
              <View style={styles.modalCard}>
                <CustomText variant="bold" style={styles.modalTitle}>
                  {rejectType === "EVENT" ? "Từ Chối Sự Kiện" : "Từ Chối Yêu Cầu CLB"}
                </CustomText>
                <CustomText style={styles.modalSub}>
                  {rejectType === "EVENT" 
                    ? "Lý do từ chối sẽ được gửi trực tiếp đến người tổ chức sự kiện."
                    : "Lý do từ chối nâng cấp tài khoản CLB sẽ được gửi tới sinh viên."}
                </CustomText>
                <TextInput
                  style={styles.reasonInput}
                  placeholder={rejectType === "EVENT" ? "Nhập lý do từ chối sự kiện này..." : "Nhập lý do từ chối nâng cấp CLB..."}
                  placeholderTextColor="#9CA3AF"
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setRejectModalVisible(false)}
                    disabled={rejecting}
                  >
                    <CustomText variant="bold" style={styles.modalCancelText}>Quay lại</CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmBtn}
                    onPress={handleReject}
                    disabled={rejecting}
                  >
                    {rejecting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <CustomText variant="bold" style={styles.modalConfirmText}>
                        Xác nhận
                      </CustomText>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.color.background || "#F8F9FA",
  },
  screenHeader: {
    paddingVertical: 10,
  },
  screenTitle: {
    fontSize: 26,
    color: "#1B2B52",
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 60,
  },
  listContainer: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
  },
  bannerImage: {
    width: 95,
    height: 95,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
  },
  pendingBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FEF7E0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  pendingText: {
    fontSize: 9,
    color: "#B06000",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    color: "#0F172A",
    lineHeight: 22,
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },
  actionSection: {
    gap: 12,
  },
  roomInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  roomInput: {
    flex: 1,
    color: "#1F2937",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FEB2B2",
  },
  rejectBtnText: {
    color: "#EF4444",
    fontSize: 14,
  },
  approveBtn: {
    flex: 1.5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: Colors.color.primary,
    shadowColor: Colors.color.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  approveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: "#EF4444",
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 16,
  },
  reasonInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 20,
    color: "#1F2937",
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    color: "#4B5563",
    fontSize: 14,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#6B7280",
  },
  activeTabText: {
    color: Colors.color.primary,
  },
  avatarFallbackSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialSmall: {
    fontSize: 22,
    color: Colors.color.primary,
  },
  pendingBadgeClub: {
    alignSelf: "flex-start",
    backgroundColor: "#E1F5FE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  pendingTextClub: {
    fontSize: 9,
    color: "#0288D1",
    letterSpacing: 0.5,
  },
});
