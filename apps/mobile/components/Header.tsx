import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import NotificationsScreen from "@/app/(attendee)/NotificationScreen";
import { CustomText } from "@/components/CustomText";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const Header = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState(false);
  return (
    <View style={styles.header}>
      <MaterialCommunityIcons
        name="domain"
        size={40}
        color={Colors.color.white}
      />
      <CustomText style={styles.connect}>
        {" "}
        <CustomText variant="bold" style={{ color: "#FFFFFF" }}>
          EVENT{" "}
        </CustomText>
        CONNECT
      </CustomText>
      <View style={styles.Icon}>
        <TouchableOpacity onPress={() => setNotifications(true)}>
          <MaterialCommunityIcons
            name="bell-outline"
            size={40}
            color={Colors.color.white}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/AccountScreen")}>
          <MaterialCommunityIcons
            name="account"
            size={40}
            color={Colors.color.primary}
            style={styles.accountIcon}
          />
        </TouchableOpacity>
      </View>
      <Modal
        visible={notifications}
        onRequestClose={() => setNotifications(false)}
        animationType="fade"
        transparent={true}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setNotifications(false)}
            />
            <View style={styles.notificationBox}>
              <View style={styles.notificationHeader}>
                <CustomText variant="bold" style={styles.notificationTitle}>
                  Thông báo
                </CustomText>
              </View>
              <NotificationsScreen isOpen={notifications} />
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
};
export default Header;
const styles = StyleSheet.create({
  header: {
    height: 60,
    alignItems: "center",
    backgroundColor: Colors.color.primary,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
  },
  connect: {
    fontSize: 18,
    color: Colors.color.white,
  },
  accountIcon: {
    height: 40,
    backgroundColor: Colors.color.lightblue,
    borderRadius: 20,
  },
  Icon: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginLeft: "auto",
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
  notificationItem: {
    paddingVertical: 5,
  },
  notificationText: {
    color: "#666",
    fontSize: 14,
  },
});
