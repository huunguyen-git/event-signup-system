import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '../constants/theme';

const ShowQrScreen = () => {
    const { id, title } = useLocalSearchParams(); // Lấy ID sự kiện từ router
    const router = useRouter();
    const qrValue = id as string;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ 
                headerShown: true, 
                title: 'Mã QR Sự Kiện',
                headerTintColor: Colors.color.white,
                headerStyle: { backgroundColor: Colors.color.primary }
            }} />

            <View style={styles.content}>
                <Text style={styles.eventTitle}>{title || "Sự kiện của bạn"}</Text>
                
                <View style={styles.qrWrapper}>
                    {/* Component vẽ mã QR */}
                    <QRCode
                        value={qrValue}
                        size={250}
                        color="black"
                        backgroundColor="white"
                        logo={require('../assets/images/icon.png')} // Thêm logo app vào giữa QR (nếu có)
                        logoSize={50}
                        logoBorderRadius={10}
                    />
                </View>

                <Text style={styles.instruction}>
                    Đưa mã này cho nhân viên soát vé để check-in
                </Text>

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => router.back()}
                >
                    <Text style={styles.buttonText}>Đóng</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    eventTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.color.primary,
        marginBottom: 30,
        textAlign: 'center',
    },
    qrWrapper: {
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        elevation: 5, // Hiệu ứng đổ bóng trên Android
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    instruction: {
        marginTop: 30,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    button: {
        marginTop: 50,
        backgroundColor: Colors.color.primary,
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 25,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});