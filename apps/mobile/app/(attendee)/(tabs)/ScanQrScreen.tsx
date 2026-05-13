import {View,StyleSheet,Text, Alert} from "react-native"
import {MaterialCommunityIcons} from "@expo/vector-icons"
import {Colors} from "../../../constants/theme"
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useState } from "react";
// @ts-ignore
import { Camera, CameraType } from 'react-native-camera-kit';
import { Stack, useRouter } from "expo-router";
import {EventService} from "@/axios/eventService";
import { useFocusEffect } from "@react-navigation/native";


const QrScreen = () =>{
    const router = useRouter();
    const [isScanned, setIsScanned] = useState(false);
    const [scankey,setScanKey] = useState(0);

    useFocusEffect(
        useCallback(()=>{
            setIsScanned(false);
            setScanKey(prev => prev + 1);
        },[])
    )
    const onReadCode = async (event: any) => {
    // Nếu đang xử lý mã trước đó rồi thì bỏ qua
        console.log("isscanned:", isScanned); // Log trạng thái để kiểm tra
        if (isScanned) return; 

        const qrData = event.nativeEvent.codeStringValue;
        
        if (qrData) {
            setIsScanned(true); // Khóa camera lập tức để không bị gọi API 10 lần/giây
            console.log("🚀 Camera vừa quét được mã:", qrData); // Log ra để kiểm tra
            
            // Đưa try-catch vào BÊN TRONG if (qrData)
            try {
                const data = await EventService.getEvent(qrData);
                
                // Sửa thành if (data) -> Có dữ liệu mới chuyển trang
                if (data) { 
                    router.push({
                        pathname: "/EventDetailsScreen",
                        params: { id: qrData }
                    });
                } else {
                    Alert.alert("Thông báo", "Mã QR này không thuộc về bất kỳ sự kiện nào.");
                    setIsScanned(false); // Mở khóa camera để quét mã khác
                }
            }
            catch (error) {
                console.error("Lỗi API khi lấy sự kiện:", error);
                Alert.alert("Lỗi", "Không thể tìm thấy sự kiện, vui lòng thử lại.");
                setIsScanned(false); // Mở khóa camera khi gặp lỗi mạng/API
            }
        }
    }
    return <>
    <Stack.Screen options={{ headerShown: false }} />
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <MaterialCommunityIcons name="domain" size={40} color={Colors.color.white}/>
            <Text style={styles.connect}> <Text style={styles.event}>EVENT </Text>CONNECT</Text>
            <View style={styles.Icon}>
            <MaterialCommunityIcons name="bell-outline" size={40} color={Colors.color.white}/>
            <MaterialCommunityIcons name="account" size={40} color={Colors.color.primary} style={styles.accountIcon}/>
            </View>
        </View>
        <View style={styles.body}>
          <Text style={styles.instruction}>Căn chỉnh mã QR vào khung để quét</Text>
          
          <View style={styles.cameraWrapper}>
            <Camera
                key={scankey} // Thêm key để reset camera khi cần
                style={{ flex: 1, width: '100%', height: '100%' }}
                cameraType={CameraType.Back}
                scanBarcode={true}
                onReadCode={onReadCode}
                // Thêm dòng này để vá lỗi Hermes engine của thư viện trên Android
                // @ts-ignore
                zoom={0} 
            />

            <View style={styles.overlay}>
              <View style={styles.unfocusedContainer} />
              <View style={{ flexDirection: 'row', height: 250 }}>
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
};
export default QrScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.color.white,
    },
    header:{
        height: 60,
        alignItems: "center",
        backgroundColor: Colors.color.primary,
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 10,
    },
    connect:{
        fontSize: 18,
        color: Colors.color.white,
    },
    event:{
        fontWeight: 700,
    },
    accountIcon:{
        height: 40,
        backgroundColor: "#afc5e1",
        borderRadius: 20,
    },
    Icon:{
        flexDirection: "row",
        gap:10,
        alignItems: "center",
        marginLeft: "auto",
    },
    body:{
        backgroundColor: Colors.color.background,
        flex: 1,
        padding:10,
    },
    ScanQr:{
        fontSize: 20,
        fontWeight: "bold",
        marginRight: "auto",
    },
        instruction: { 
        color: '#ccc', 
        marginBottom: 20, 
        fontSize: 16 
    },
        cameraWrapper: {
        width: '100%',
        flex: 1,
        position: 'relative',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)', 
    },
    focusedContainer: {
        width: 250,
        height: 250,
        backgroundColor: 'transparent',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#6200ee',
        borderWidth: 4,
    },
    topLeft: { 
        top: 0, 
        left: 0, 
        borderRightWidth: 0, 
        borderBottomWidth: 0, 
        borderTopLeftRadius: 15 
    },
    topRight: { 
        top: 0, 
        right: 0, 
        borderLeftWidth: 0, 
        borderBottomWidth: 0, 
        borderTopRightRadius: 15 
    },
    bottomLeft: { 
        bottom: 0, 
        left: 0, 
        borderRightWidth: 0, 
        borderTopWidth: 0, 
        borderBottomLeftRadius: 15 
    },
    bottomRight: { 
        bottom: 0, 
        right: 0, 
        borderLeftWidth: 0, 
        borderTopWidth: 0, 
        borderBottomRightRadius: 15 
    },
    
}); 