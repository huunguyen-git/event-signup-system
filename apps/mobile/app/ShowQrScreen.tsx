import React from "react";
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { CustomText } from "@/components/CustomText";
import QRCode from "react-native-qrcode-svg";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Colors } from "../constants/theme";

const ShowQrScreen = () => {
  const { id, title } = useLocalSearchParams(); // Lấy ID sự kiện từ router
  const router = useRouter();
  const qrValue = id as string;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Mã QR Sự Kiện",
          headerTintColor: Colors.color.white,
          headerStyle: { backgroundColor: Colors.color.primary },
        }}
      />

      <View style={styles.content}>
        <CustomText variant="bold" style={styles.eventTitle}>
          {title || "Sự kiện của bạn"}
        </CustomText>

        <View style={styles.qrWrapper}>
          {/* Component vẽ mã QR */}
          <QRCode
            value={qrValue}
            size={250}
            color="black"
            backgroundColor="white"
            logo={require("../assets/images/icon.png")} // Thêm logo app vào giữa QR (nếu có)
            logoSize={50}
            logoBorderRadius={10}
          />
        </View>

        <CustomText style={styles.instruction}>
          Đưa mã này cho nhân viên soát vé để check-in
        </CustomText>

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <CustomText variant="bold" style={styles.buttonText}>
            Đóng
          </CustomText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ShowQrScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  eventTitle: {
    fontSize: 22,
    color: Colors.color.primary,
    marginBottom: 30,
    textAlign: "center",
  },
  qrWrapper: {
    padding: 25,
    backgroundColor: "white",
    borderRadius: 24,
    elevation: 8, // Hiệu ứng đổ bóng trên Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  instruction: {
    marginTop: 30,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 50,
    backgroundColor: Colors.color.primary,
    paddingVertical: 14,
    paddingHorizontal: 45,
    borderRadius: 30,
    shadowColor: Colors.color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
