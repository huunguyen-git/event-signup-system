import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import { Colors } from "../constants/theme";
import { Users, MessageSquare, TrendingUp } from "lucide-react-native";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { useRouter } from "expo-router";
import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "@/axios/axios";
import { getToken } from "@/services/storage";

interface HostItem {
  event: ICreateEvent;
  onRefresh?: () => void;
}

const HostEventItem = ({ event, onRefresh }: HostItem) => {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const eventStatus = event.status?.toUpperCase() || "DRAFT";
  const isCompleted = eventStatus === "COMPLETED";
  const isDraft = eventStatus === "DRAFT";
  const isPublished = eventStatus === "PUBLISHED" || eventStatus === "LIVE";
  const isCancelled = eventStatus === "CANCELLED"; // Xác định trạng thái đã huỷ

  const statusColors = {
    LIVE: "#28a745",
    PUBLISHED: "#28a745",
    DRAFT: "#ffc107",
    COMPLETED: "#6c757d",
    CANCELLED: "#dc3545", // Đã thêm màu đỏ
  };

  const handleDelete = () => {
    Alert.alert("Cảnh báo", "Bạn có chắc chắn muốn xoá vĩnh viễn sự kiện này không?", [
      { text: "Huỷ", style: "cancel" },
      { text: "Xoá", style: "destructive", onPress: async () => {
          try {
            const token = await getToken();
            await apiClient.delete(`/events/${event.id}`, { headers: { Authorization: `Bearer ${token}` } });
            Alert.alert("Thành công", "Đã xoá sự kiện.");
            if(onRefresh) onRefresh();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xoá sự kiện này.");
          }
      }}
    ]);
  };

  const handleCancelEvent = async () => {
    if(!cancelReason.trim()){
      Alert.alert("Lỗi", "Vui lòng nhập lý do huỷ sự kiện.");
      return;
    }
    try {
      const token = await getToken();
      await apiClient.patch(`/events/${event.id}/cancel`, { reason: cancelReason }, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert("Thành công", "Đã huỷ sự kiện và gửi thông báo cho người tham gia.");
      setShowCancelModal(false);
      setCancelReason("");
      if(onRefresh) onRefresh(); // Gọi lại fetch data để cập nhật giao diện
    } catch (error) {
      Alert.alert("Lỗi", "Huỷ sự kiện thất bại.");
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <CustomText variant="bold" style={styles.title} numberOfLines={1}>
          {event.title}
        </CustomText>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[eventStatus as keyof typeof statusColors] || "#666" }]}>
          <CustomText variant="bold" style={styles.statusText}>{eventStatus}</CustomText>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <CustomText variant="medium" style={styles.detailsLabel}>Details</CustomText>
        <View style={styles.stat}>
          <MessageSquare size={14} color="#666" />
          <CustomText style={styles.statValue}>{(event as any)._count?.comments || 0}</CustomText>
        </View>
        <View style={styles.stat}>
          <Users size={14} color="#666" />
          <CustomText style={styles.statValue}>{(event as any)._count?.applications || 0}</CustomText>
        </View>
      </View>

      <View style={styles.buttonRow}>
        {/* Disable nút Edit nếu sự kiện đã Hoàn thành hoặc Đã Huỷ */}
        <TouchableOpacity
          style={[styles.secondaryButton, (isCompleted || isCancelled) && { opacity: 0.5, backgroundColor: '#f0f0f0' }]}
          disabled={isCompleted || isCancelled}
          onPress={() => router.push({ pathname: "/EditEventScreen", params: { id: event.id } })}
        >
          <CustomText variant="medium" style={styles.secondaryButtonText}>Edit</CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push({ pathname: "/ViewAttendeesScreen", params: { id: event.id } })}
        >
          <CustomText variant="medium" style={styles.primaryButtonText}>View Attendees</CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.dangerRow}>
        {(isDraft || isCompleted || isCancelled) && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash" size={14} color="#dc3545" />
            <CustomText style={styles.deleteBtnText}>Delete Event</CustomText>
          </TouchableOpacity>
        )}

        {/* Chỉ hiện nút Cancel nếu đang PUBLISHED hoặc LIVE */}
        {isPublished && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCancelModal(true)}>
            <Ionicons name="close-circle" size={14} color="#dc3545" />
            <CustomText style={styles.deleteBtnText}>Cancel Event</CustomText>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <CustomText variant="bold" style={styles.modalTitle}>Huỷ Sự Kiện</CustomText>
            <CustomText style={styles.modalSub}>Vui lòng nhập lý do. Hệ thống sẽ tự động gửi thông báo đến các Attendees.</CustomText>
            <TextInput
              style={styles.reasonInput}
              placeholder="Ví dụ: Sự cố thời tiết..."
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowCancelModal(false)}>
                <CustomText variant="bold">Quay lại</CustomText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleCancelEvent}>
                <CustomText variant="bold" style={{color: 'white'}}>Xác nhận Huỷ</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.color.white, borderRadius: 16, padding: 15,
    marginHorizontal: 16, marginBottom: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 16, color: "#1B2B52", flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { color: "white", fontSize: 11 },
  detailsRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  detailsLabel: { fontSize: 13, color: "#1B2B52", marginRight: 12 },
  stat: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  statValue: { fontSize: 13, color: "#666", marginLeft: 4 },
  buttonRow: { flexDirection: "row", marginTop: 15, gap: 10 },
  secondaryButton: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: "#EBF2FF", borderWidth: 1, borderColor: "#ADC8FF", alignItems: "center" },
  secondaryButtonText: { color: "#1B2B52" },
  primaryButton: { flex: 2, paddingVertical: 8, borderRadius: 20, backgroundColor: "#E1E9F4", alignItems: "center" },
  primaryButtonText: { color: "#1B2B52" },

  dangerRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffe5e5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffe5e5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  deleteBtnText: { color: '#dc3545', fontSize: 12, marginLeft: 4, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: 'white', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 18, color: '#d9534f', marginBottom: 10 },
  modalSub: { fontSize: 13, color: '#666', marginBottom: 15 },
  reasonInput: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 15, minHeight: 80, textAlignVertical: 'top', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancelBtn: { padding: 10, borderRadius: 8, backgroundColor: '#eee' },
  modalConfirmBtn: { padding: 10, borderRadius: 8, backgroundColor: '#d9534f' },
});

export default HostEventItem;