import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; // 1. Thêm useLocalSearchParams
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';

export default function SuccessScreen() {
    const router = useRouter();
    const themeColor = Colors.light.tint;

    // 2. LẤY DỮ LIỆU TICKET TYPE TỪ MÀN 2 GỬI SANG
    const { ticketType } = useLocalSearchParams();

    return (
        <View style={styles.overlayContainer}>
            <View style={styles.successCard}>
                {/* Vòng tròn tích xanh */}
                <View style={styles.iconCircle}>
                    <Ionicons name="checkmark" size={50} color="#4CAF50" />
                </View>

                <Text style={styles.mainTitle}>REGISTRATION SUCCESSFUL!</Text>

                <Text style={styles.description}>
                    Thank you for registering for the <Text style={{fontWeight: 'bold'}}>International Tech Summit 2024</Text>.
                    Your registration for the <Text style={{fontWeight: 'bold', color: themeColor}}>{ticketType || 'Standard Pass'}</Text> is confirmed.
                </Text>

                {/* Khung chi tiết màu xám */}
                <View style={styles.detailsBox}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Order Number:</Text>
                        <Text style={styles.detailValue}>ITS-2026-5678</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Pass Type:</Text>
                        {/* 3. HIỂN THỊ LOẠI VÉ ĐÃ CHỌN TẠI ĐÂY */}
                        <Text style={styles.detailValue}>{ticketType || 'Standard Pass'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date:</Text>
                        <Text style={styles.detailValue}>Oct 12-14, 2026</Text>
                    </View>
                </View>

                {/* Nút bấm */}
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: themeColor }]}>
                    <Text style={styles.primaryBtnText}>VIEW MY TICKET</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => router.dismissAll()}
                >
                    <Text style={[styles.secondaryBtnText, { color: '#555' }]}>GO TO MY DASHBOARD</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 25 },
    successCard: { backgroundColor: 'white', padding: 30, borderRadius: 35, alignItems: 'center', elevation: 15 },
    iconCircle: {
        width: 90, height: 90, borderRadius: 45, borderWidth: 6,
        borderColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 20
    },
    mainTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, color: '#333' },
    description: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 19, marginBottom: 25 },
    detailsBox: { width: '100%', backgroundColor: '#E9ECEF', padding: 18, borderRadius: 20, marginBottom: 25 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    detailLabel: { color: '#666', fontSize: 13 },
    detailValue: { fontWeight: 'bold', color: '#000', fontSize: 13 },
    primaryBtn: { width: '100%', padding: 16, borderRadius: 30, alignItems: 'center', marginBottom: 12 },
    primaryBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
    secondaryBtn: { width: '100%', padding: 16, borderRadius: 30, alignItems: 'center', backgroundColor: '#F1F3F5' },
    secondaryBtnText: { fontWeight: 'bold', fontSize: 15 }
});