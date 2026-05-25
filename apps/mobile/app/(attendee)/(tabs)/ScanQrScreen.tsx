import {
  View,
  StyleSheet,
  Alert,
  Button,
  TouchableOpacity,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { EventService } from "@/axios/eventService";
import { CameraView, useCameraPermissions } from "expo-camera";
import Header from "@/components/Header";

const QrScreen = () => {
  const router = useRouter();
  const [isScanned, setIsScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);
  if (!permission) {
    return <View />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <CustomText style={{ textAlign: "center" }}>
          Chúng tôi cần quyền sử dụng camera
        </CustomText>
        <TouchableOpacity onPress={requestPermission}>
          <CustomText>Cấp quyền Camera</CustomText>
        </TouchableOpacity>
      </View>
    );
  }
  const onReadCode = async ({ data }: any) => {
    console.log("isscanned:", isScanned);
    if (isScanned) return;

    const qrData = data.trim();

    if (qrData) {
      setIsScanned(true);
      console.log("🚀 Camera vừa quét được mã:", qrData);
      try {
        const data = await EventService.getEvent(qrData);
        if (data) {
          router.push({
            pathname: "/EventDetailsScreen",
            params: { id: qrData },
          });
        } else {
          Alert.alert(
            "Thông báo",
            "Mã QR này không thuộc về bất kỳ sự kiện nào.",
          );
          setIsScanned(false);
        }
      } catch (error) {
        console.error("Lỗi API khi lấy sự kiện:", error);
        Alert.alert("Lỗi", "Không thể tìm thấy sự kiện, vui lòng thử lại.");
        setIsScanned(false);
      }
    }
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.body}>
          <CustomText style={styles.instruction}>
            Căn chỉnh mã QR vào khung để quét
          </CustomText>

          <View style={styles.cameraWrapper}>
            <CameraView
              style={{ flex: 1, width: "100%", height: "100%" }}
              facing="back"
              onBarcodeScanned={isScanned ? undefined : onReadCode}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            />
            {isScanned && (
              <View style={styles.overlay}>
                <Button
                  title={"Chạm để quét lại"}
                  onPress={() => setIsScanned(false)}
                />
              </View>
            )}

            <View style={styles.overlay}>
              <View style={styles.unfocusedContainer} />
              <View style={{ flexDirection: "row", height: 250 }}>
                <View style={styles.unfocusedContainer} />
                <View style={styles.focusedContainer}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
                <View style={styles.unfocusedContainer} />
              </View>

              {/* Vùng mờ dưới */}
              <View style={styles.unfocusedContainer} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};
export default QrScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color.white,
  },
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
  event: {},
  accountIcon: {
    height: 40,
    backgroundColor: "#afc5e1",
    borderRadius: 20,
  },
  Icon: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginLeft: "auto",
  },
  body: {
    backgroundColor: Colors.color.background,
    flex: 1,
    padding: 10,
  },
  ScanQr: {
    fontSize: 20,
    marginRight: "auto",
  },
  instruction: {
    color: "#ccc",
    marginBottom: 20,
    fontSize: 16,
  },
  cameraWrapper: {
    width: "100%",
    flex: 1,
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  focusedContainer: {
    width: 250,
    height: 250,
    backgroundColor: "transparent",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#6200ee",
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 15,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 15,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 15,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 15,
  },
});
