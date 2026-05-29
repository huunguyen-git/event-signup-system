import {
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";
import { useRouter } from "expo-router";
import { CustomText } from "@/components/CustomText";
import NotificationBell from "@/components/NotificationBell";

const Header = () => {
  const router = useRouter();
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
        <NotificationBell />
        <TouchableOpacity onPress={() => router.push("/AccountScreen")}>
          <MaterialCommunityIcons
            name="account"
            size={40}
            color={Colors.color.primary}
            style={styles.accountIcon}
          />
        </TouchableOpacity>
      </View>
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
});
