import { View, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import NotificationsScreen from "@/app/(attendee)/NotificationScreen";
import { CustomText } from "@/components/CustomText";
const Header = () =>{
    const router = useRouter();
    const [notifications, setNotifications] = useState(false);
    return(
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="domain"
            size={40}
            color={Colors.color.white}
          />
          <CustomText style={styles.connect}>
            {" "}
            <CustomText variant="bold" style={{color: "#FFFFFF"}}>EVENT </CustomText>CONNECT
          </CustomText>
          <View style={styles.Icon}>
            <TouchableOpacity onPress={()=> setNotifications(true)}>
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
            transparent={true}>
            <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setNotifications(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.notificationBox}>
              
              <View style={styles.notificationHeader}>
                <CustomText variant="bold" style={styles.notificationTitle}>Thông báo</CustomText>
              </View>
              <NotificationsScreen isOpen={notifications} />
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
          </Modal>
        </View>
    )
}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  notificationBox: {
    marginTop: 65,
    marginRight: 10,
    width: 280,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
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
})