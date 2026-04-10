import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View, Modal
} from 'react-native';
import { Colors } from '../constants/theme';

export default function RegistrationFormScreen() {
    const router = useRouter();
    const themeColor = Colors.light.tint;

    // --- QUẢN LÝ TRẠNG THÁI ---
    const [agreed, setAgreed] = useState(false);
    const [ticketType, setTicketType] = useState('Standard Pass');

    const [showTicketPicker, setShowTicketPicker] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    // CHỈ CÒN TÊN 2 LOẠI VÉ
    const ticketOptions = [
        { id: '1', name: 'Standard Pass' },
        { id: '2', name: 'Premium Pass' },
    ];

    const InputField = ({ label, placeholder, isShort }: any) => (
        <View style={[styles.inputGroup, isShort && { flex: 1 }]}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor="#bbb" />
            </View>
        </View>
    );

    const InfoModal = ({ visible, title, content, onClose }: any) => (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.infoOverlay}>
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>{title}</Text>
                    <ScrollView style={{ maxHeight: 250 }}>
                        <Text style={styles.infoBodyText}>{content}</Text>
                    </ScrollView>
                    <TouchableOpacity
                        style={[styles.infoCloseBtn, { backgroundColor: themeColor }]}
                        onPress={onClose}
                    >
                        <Text style={styles.infoCloseBtnText}>ĐÓNG</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.overlayContainer}>
            <TouchableOpacity style={styles.dismissArea} onPress={() => router.back()} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.modalCard}>
                    <Text style={styles.eventSmallTitle}>International Tech Summit 2024</Text>
                    <Text style={[styles.mainTitle, { color: themeColor }]}>CONFIRM REGISTRATION</Text>

                    <View style={styles.ticketSummary}>
                        <View>
                            <Text style={styles.ticketLabel}>REGISTERING AS:</Text>
                            <Text style={styles.ticketType}>{ticketType}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowTicketPicker(true)}>
                            <Text style={[styles.changeLink, { color: themeColor }]}>Change</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
                        <View style={styles.row}>
                            <InputField label="First Name" placeholder="A" isShort />
                            <View style={{ width: 10 }} />
                            <InputField label="Last Name" placeholder="Nguyễn Văn" isShort />
                        </View>
                        <InputField label="Company Email" placeholder="nguyenvana@gmail.com" />
                        <InputField label="Job Title" placeholder="Software Engineer" />

                        <View style={styles.checkboxRow}>
                            <TouchableOpacity onPress={() => setAgreed(!agreed)}>
                                <MaterialCommunityIcons
                                    name={agreed ? "checkbox-marked" : "checkbox-blank-outline"}
                                    size={24} color={themeColor}
                                />
                            </TouchableOpacity>
                            <Text style={styles.checkboxText}>
                                I agree to the{' '}
                                <Text style={styles.boldLink} onPress={() => setShowTerms(true)}>Terms of Service</Text>
                                {' '}and{' '}
                                <Text style={styles.boldLink} onPress={() => setShowPrivacy(true)}>Privacy Policy</Text>.
                            </Text>
                        </View>
                    </ScrollView>

                    <View style={styles.footerRow}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                            <Text style={[styles.cancelBtnText, { color: themeColor }]}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.completeBtn, { backgroundColor: themeColor, opacity: agreed ? 1 : 0.5 }]}
                            disabled={!agreed}
                            onPress={() => router.replace({
                                pathname: '/success',
                                params: { ticketType: ticketType }
                            })}
                        >
                            <Text style={styles.completeBtnText}>COMPLETE REGISTRATION</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* MODAL CHỌN VÉ - CHỈ HIỆN TÊN */}
            <Modal visible={showTicketPicker} transparent animationType="slide">
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerCard}>
                        <Text style={styles.pickerHeader}>Select Ticket Type</Text>
                        {ticketOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[styles.optionCard, ticketType === option.name && { borderColor: themeColor, borderWidth: 2 }]}
                                onPress={() => { setTicketType(option.name); setShowTicketPicker(false); }}
                            >
                                <Text style={[styles.optionName, ticketType === option.name && { color: themeColor }]}>
                                    {option.name}
                                </Text>
                                {ticketType === option.name && <Ionicons name="checkmark-circle" size={20} color={themeColor} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.pickerClose} onPress={() => setShowTicketPicker(false)}>
                            <Text style={{ color: '#999', fontWeight: 'bold' }}>QUAY LẠI</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <InfoModal
                visible={showTerms}
                title="Terms of Service"
                content="Nội dung điều khoản dịch vụ chi tiết ở đây..."
                onClose={() => setShowTerms(false)}
            />
            <InfoModal
                visible={showPrivacy}
                title="Privacy Policy"
                content="Nội dung chính sách bảo mật chi tiết ở đây..."
                onClose={() => setShowPrivacy(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    overlayContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    dismissArea: { ...StyleSheet.absoluteFillObject },
    modalCard: { backgroundColor: 'white', borderRadius: 30, padding: 25, elevation: 20 },
    eventSmallTitle: { fontSize: 13, color: '#666', textAlign: 'center' },
    mainTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 5, marginBottom: 15 },
    ticketSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F1F3F5', padding: 15, borderRadius: 12, marginBottom: 20 },
    ticketLabel: { fontSize: 11, color: '#777', fontWeight: 'bold' },
    ticketType: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    changeLink: { textDecorationLine: 'underline', fontWeight: 'bold', fontSize: 13 },
    row: { flexDirection: 'row' },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 12, fontWeight: 'bold', color: '#444', marginBottom: 5 },
    inputWrapper: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#FFF' },
    input: { paddingVertical: 10, fontSize: 15, color: '#000' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 15 },
    checkboxText: { marginLeft: 8, fontSize: 12, color: '#666', flex: 1 },
    boldLink: { fontWeight: 'bold', textDecorationLine: 'underline', color: '#333' },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    cancelBtn: { flex: 1, padding: 15, alignItems: 'center', marginRight: 10, borderRadius: 25, backgroundColor: '#F1F3F5', justifyContent: 'center' },
    cancelBtnText: { fontWeight: 'bold', fontSize: 15 },
    completeBtn: { flex: 2, padding: 15, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
    completeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15, textAlign: 'center' },

    // Picker Styles
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    pickerCard: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
    pickerHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    optionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, backgroundColor: '#f8f9fa', borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
    optionName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
    pickerClose: { padding: 15, alignItems: 'center' },

    // Info Modal Styles
    infoOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 30 },
    infoCard: { backgroundColor: 'white', borderRadius: 25, padding: 25, alignItems: 'center' },
    infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    infoBodyText: { fontSize: 14, color: '#555', lineHeight: 22, textAlign: 'center' },
    infoCloseBtn: { marginTop: 25, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20 },
    infoCloseBtnText: { color: 'white', fontWeight: 'bold' }
});