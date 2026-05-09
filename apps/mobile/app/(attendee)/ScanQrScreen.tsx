import {View,StyleSheet,Text, Alert} from "react-native"
import {MaterialCommunityIcons} from "@expo/vector-icons"
import {Colors} from "../../constants/theme"
import { SafeAreaView } from 'react-native-safe-area-context';
// @ts-ignore
import { Camera, CameraType } from 'react-native-camera-kit';
import { Stack } from "expo-router";

interface QRScannerEvent {
  nativeEvent: {
    codeStringValue: string;
  };
}

const QrScreen = () =>{
    const onReadCode = (event: QRScannerEvent) => {
    const qrData = event.nativeEvent.codeStringValue;
    if (qrData) {
      Alert.alert("Event Connect", `Đã xác nhận mã: ${qrData}`);
    }
  };
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