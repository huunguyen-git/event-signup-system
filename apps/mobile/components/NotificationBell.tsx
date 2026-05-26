import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";
import { getUserId } from "@/services/storage";
import { NotificationService } from "@/axios/notificationService";
import NotificationsScreen from "@/app/(attendee)/NotificationScreen";
import { CustomText } from "@/components/CustomText";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface NotificationBellProps {
  size?: number;
  color?: string;
}

export default function NotificationBell({ size = 40, color = Colors.color.white }: NotificationBellProps) {
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;
      const data = await NotificationService.getUserNotifications(userId);
      const unread = data.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (e) {
      console.log("Error fetching unread count:", e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [notificationsVisible]);

  return (
    <View>
      <TouchableOpacity onPress={() => setNotificationsVisible(true)} style={{ position: "relative" }}>
        <MaterialCommunityIcons
          name="bell-outline"
          size={size}
          color={color}
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <CustomText variant="bold" style={styles.badgeText}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </CustomText>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={notificationsVisible}
        onRequestClose={() => setNotificationsVisible(false)}
        animationType="fade"
        transparent={true}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setNotificationsVisible(false)}
            />
            <View style={styles.notificationBox}>
              <View style={styles.notificationHeader}>
                <CustomText variant="bold" style={styles.notificationTitle}>
                  Thông báo
                </CustomText>
              </View>
              <NotificationsScreen isOpen={notificationsVisible} />
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 8,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  notificationBox: {
    position: "absolute",
    top: 65,
    right: 10,
    width: 280,
    height: 480,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    zIndex: 10,
  },
  notificationHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
    marginBottom: 10,
  },
  notificationTitle: {
    fontSize: 16,
    color: "#333",
  },
});
