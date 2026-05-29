import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Image } from "react-native";
import { Colors } from "../constants/theme";
import { Users, MessageSquare, Calendar, Edit2, Trash2, Ban } from "lucide-react-native";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { useRouter } from "expo-router";
import { CustomText } from "@/components/CustomText";
import { EventService } from "@/axios/eventService";
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
  const isCompleted = eventStatus === "COMPLETED" || eventStatus === "COMPLETE";
  const isDraft = eventStatus === "DRAFT";
  const isPublished = eventStatus === "PUBLISHED" || eventStatus === "LIVE";
  const isCancelled = eventStatus === "CANCELLED";

  const statusColors = {
    LIVE: { bg: "#E6F4EA", text: "#137333", label: "LIVE" },
    PUBLISHED: { bg: "#E6F4EA", text: "#137333", label: "PUBLISHED" },
    DRAFT: { bg: "#FEF7E0", text: "#B06000", label: "DRAFT" },
    COMPLETED: { bg: "#F1F3F4", text: "#5F6368", label: "COMPLETED" },
    COMPLETE: { bg: "#F1F3F4", text: "#5F6368", label: "COMPLETED" },
    CANCELLED: { bg: "#FCE8E6", text: "#C5221F", label: "CANCELLED" },
  };

  const statusStyle = statusColors[eventStatus as keyof typeof statusColors] || {
    bg: "#F1F3F4",
    text: "#5F6368",
    label: eventStatus,
  };

  const bannerSource = event.banner_url
    ? { uri: event.banner_url }
    : require("../assets/images/icon.png");

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

  const handleCancelEvent = async () => {
    if (!cancelReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do huỷ sự kiện.");
      return;
    }
    try {
      const token = await getToken();
      await apiClient.patch(
        `/events/${event.id}/cancel`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Thành công", "Đã huỷ sự kiện và gửi thông báo cho người tham gia.");
      setShowCancelModal(false);
      setCancelReason("");
      if (onRefresh) onRefresh();
    } catch (error) {
      Alert.alert("Lỗi", "Huỷ sự kiện thất bại.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xoá",
      `Bạn có chắc chắn muốn xoá sự kiện "${event.title}" không? Hành động này không thể hoàn tác.`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              await apiClient.delete(`/events/${event.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert("Thành công", "Đã xoá sự kiện.");
              if (onRefresh) onRefresh();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xoá sự kiện này.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.mainContainer}>
        <Image source={bannerSource} style={styles.bannerImage} resizeMode="cover" />

        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <CustomText variant="bold" style={[styles.statusText, { color: statusStyle.text }]}>
                {statusStyle.label}
              </CustomText>
            </View>
          </View>

          <CustomText variant="bold" style={styles.title} numberOfLines={2}>
            {event.title}
          </CustomText>

          <View style={styles.dateRow}>
            <Calendar size={14} color="#6B7280" style={{ marginRight: 6 }} />
            <CustomText style={styles.dateText}>
              {formatEventDate(event.event_date)}
            </CustomText>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Users size={12} color="#0B2D4F" style={{ marginRight: 4 }} />
              <CustomText variant="medium" style={styles.statText}>
                {`${(event as any)._count?.applications || 0} / ${event.max_attendees || 0}`}
              </CustomText>
            </View>

            <View style={styles.statBadge}>
              <MessageSquare size={12} color="#4B5563" style={{ marginRight: 4 }} />
              <CustomText variant="medium" style={styles.statText}>
                {`${(event as any)._count?.comments || 0}`}
              </CustomText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            (isCompleted || isCancelled) && styles.disabledButton,
          ]}
          disabled={isCompleted || isCancelled}
          onPress={() =>
            router.push({
              pathname: "/EditEventScreen",
              params: { id: event.id },
            })
          }
        >
          <Edit2 size={14} color={isCompleted || isCancelled ? "#9CA3AF" : "#374151"} style={{ marginRight: 6 }} />
          <CustomText
            variant="medium"
            style={[
              styles.secondaryButtonText,
              (isCompleted || isCancelled) && styles.disabledButtonText,
            ]}
          >
            Edit
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push({
              pathname: "/ViewAttendeesScreen",
              params: { id: event.id },
            })
          }
        >
          <CustomText variant="bold" style={styles.primaryButtonText}>
            {event.status === "Draft" ? "View Vendors" : "View Attendees"}
          </CustomText>
        </TouchableOpacity>

        {isPublished ? (
          <TouchableOpacity
            style={styles.cancelIconButton}
            onPress={() => setShowCancelModal(true)}
          >
            <Ban size={18} color="#D97706" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.dangerIconButton} onPress={handleDelete}>
            <Trash2 size={18} color="#dc3545" />
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <CustomText variant="bold" style={styles.modalTitle}>
              Huỷ Sự Kiện
            </CustomText>
            <CustomText style={styles.modalSub}>
              Vui lòng nhập lý do. Hệ thống sẽ tự động gửi thông báo đến các Attendees.
            </CustomText>
            <TextInput
              style={styles.reasonInput}
              placeholder="Ví dụ: Sự cố thời tiết..."
              placeholderTextColor="#9CA3AF"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCancelModal(false)}
              >
                <CustomText variant="bold" style={styles.modalCancelText}>Quay lại</CustomText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleCancelEvent}>
                <CustomText variant="bold" style={styles.modalConfirmText}>
                  Xác nhận Huỷ
                </CustomText>
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
    backgroundColor: Colors.color.white,
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
  mainContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bannerImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    color: "#0F172A",
    lineHeight: 22,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 13,
    color: "#6B7280",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statText: {
    fontSize: 12,
    color: "#374151",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    opacity: 0.6,
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
  primaryButton: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.color.primary,
    shadowColor: Colors.color.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  cancelIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFEDD5",
    justifyContent: "center",
    alignItems: "center",
  },
  dangerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
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
});

export default HostEventItem;