import {
  View,
  StyleSheet,
  Alert,
  Button,
  TouchableOpacity,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { Colors } from "../../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { EventService } from "@/axios/eventService";
import { CameraView, useCameraPermissions } from "expo-camera";
import Header from "@/components/Header";
import { ApplicationService } from "@/axios/applicationService";
import { getUserId } from "@/services/storage";
import { NotificationService } from "@/axios/notificationService";
import * as Notifications from "expo-notifications";

const QrScreen = () => {
  const [isScanned, setIsScanned] = useState(false);
  const [myEvent ,setMyEvent] = useState([]);
  const [permission, requestPermission] = useCameraPermissions();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
    const fetchData = async () =>{
      const UserId = await getUserId();
      const data = await ApplicationService.getMyRegisteredEvents(UserId);
      setUserId(UserId ?? "")
      setMyEvent(data);
    }
    fetchData();
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
    if (isScanned) return;

    const qrData = data.trim();

    if (qrData) {
      setIsScanned(true);
      try {
        const data = await EventService.getEvent(qrData);
        if(!data){
          Alert.alert(
            "Thông báo",
            "Mã QR này không thuộc về bất kỳ sự kiện nào.",
          );
          setIsScanned(false);
          return;
        }
        if (myEvent) {
          const matchingApps: any = myEvent.filter(
            (item: any) =>
              item.status === "APPROVED" && item.event_id === qrData
          );
          if (matchingApps.length !== 0) {
            const app = matchingApps[0];
            if (app.checked_in) {
              Alert.alert(
                "Thông báo",
                "Bạn đã check-in sự kiện này trước đó rồi!"
              );
              setIsScanned(false);
            } else {
              await ApplicationService.checkIn(app.id);

              setMyEvent((prevEvents: any) =>
                prevEvents.map((item: any) =>
                  item.id === app.id ? { ...item, checked_in: true } : item
                )
              );

              const notification = {
                userId: userId,
                title: "Thông báo",
                body: `Bạn vừa check in sự kiện ${data.title}`,
              };
              await NotificationService.sendAndSaveNotification(notification);

              await Notifications.scheduleNotificationAsync({
                content: {
                  title: notification.title,
                  body: notification.body,
                  data: { eventId: data.id },
                },
                trigger: null,
              });

              Alert.alert(
                "Thành công",
                `Check-in sự kiện ${data.title} thành công!`
              );
              setIsScanned(false);
            }
          } else {
            Alert.alert(
              "Thông báo",
              "Bạn chưa đăng ký sự kiện này hoặc đăng ký chưa được duyệt."
            );
            setIsScanned(false);
          }
        }
      } catch (error) {
        console.log("Lỗi API khi lấy sự kiện:", error);
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
