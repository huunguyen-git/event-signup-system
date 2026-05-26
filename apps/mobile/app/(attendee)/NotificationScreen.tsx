import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { CustomText } from "@/components/CustomText";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { useEffect, useState } from "react";
import { Notification } from "@/axios/dto/notificationModel";
import { NotificationService } from "../../axios/notificationService";
import { getUserId } from "@/services/storage";

export default function NotificationsScreen({ isOpen }: { isOpen?: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const userId = await getUserId();
        const data = await NotificationService.getUserNotifications(userId);
        setNotifications(data);
      } catch (error) {
        console.log("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [isOpen]);

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.card, !item.isRead && styles.unreadCard]}
      activeOpacity={0.7}
      disabled={item.isRead}
      onPress={async () => {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) =>
            notif.id === item.id ? { ...notif, isRead: true } : notif,
          ),
        );
        await NotificationService.markIsRead(item.id);
      }}
    >
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconBackground,
            !item.isRead && styles.unreadIconBackground,
          ]}
        >
          <MaterialIcons
            name={item.isRead ? "notifications-none" : "notifications-active"}
            size={22}
            color={item.isRead ? "#9CA3AF" : Colors.color.primary}
          />
        </View>
      </View>
      <View style={styles.textContainer}>
        <CustomText
          variant={!item.isRead ? "bold" : "medium"}
          style={[styles.title, !item.isRead && styles.unreadText]}
          numberOfLines={1}
        >
          {item.title}
        </CustomText>
        <CustomText style={styles.body} numberOfLines={2}>
          {item.body}
        </CustomText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={Colors.color.primary} />
          <CustomText style={styles.loadingText}>Đang tải...</CustomText>
        </View>
      ) : (
        <FlatList
          style={styles.flatList}
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <CustomText style={styles.emptyText}>
                Chưa có thông báo nào.
              </CustomText>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    padding: 12,
  },
  centerContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 13,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  unreadCard: {
    backgroundColor: "#F0F9FF",
    borderColor: "#E0F2FE",
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  unreadIconBackground: {
    backgroundColor: "#DBEAFE",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    color: "#4B5563",
    marginBottom: 2,
  },
  unreadText: {
    color: "#111827",
  },
  body: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
});
