import { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { EventService } from "../../axios/eventService.js";
import * as ImagePicker from 'expo-image-picker'
import DateTimePicker from "@react-native-community/datetimepicker";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { useRouter } from "expo-router";

export default function CreateEventScreen() {
    const [image, setImage] = useState('');
    const [form, setForm] = useState<ICreateEvent>(new ICreateEvent());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const router = useRouter();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [6, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri); 
        }
    }

    const handlePublish = () => {
        form.host_id="0c3a5974-2232-4e83-87db-942c0b410c1c";
        form.allowed_domain="all";
        form.created_at=new Date().toISOString();
        form.form_config=JSON.stringify({});
        form.banner_url=image;
        form.status="DRAFT";
        console.log("du lieu create event", form);
        console.log("du lieu dang ki:", form.status);
        router.push({
            pathname: '/RegistrationFormScreen',
            params: {
                host_id: form.host_id,
                title: form.title,
                description: form.description,
                event_date: form.event_date,
                end_date: form.end_date,
                location_url: form.location_url,
                max_attendees: form.max_attendees,
                banner_url: form.banner_url,
                created_at: form.created_at,
                form_config: form.form_config,
                allowed_domain: form.allowed_domain,
                status: form.status,
                isCreate: "true",
            }
        })
        
        // EventService.createEvent(form);
    }
    const styles = createStyles();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.mainContainer}
        >
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.headerText}>CREATE NEW EVENT</Text>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* EVENT INFORMATION CARD */}
                <View style={styles.card}>
                    <Text style={styles.cardSectionTitle}>EVENT INFORMATION</Text>
                    
                    <Text style={styles.label}>Event Title</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.wrapperInput}
                            placeholder="e.g, Tech Innovators Conference"
                            placeholderTextColor='#BBB'
                            value={form.title}
                            onChangeText={(val) => setForm({...form, title: val})}
                        />
                    </View>

                    <Text style={styles.label}>Event Image (6:9)</Text>
                    <TouchableOpacity 
                        style={[
                            styles.imageContainer,
                            image && styles.imageActive
                        ]}
                        onPress={pickImage}
                    >
                        {image ? (
                            <Image 
                                source={{uri:image}}
                                style={styles.previewImage}
                            />
                        ) : (
                            <View style={styles.uploadPlaceholder}>
                                <View style={styles.cameraCircle}>
                                    <Ionicons name="camera-outline" size={24} color="#FFF" />
                                </View>
                                <Text style={styles.uploadMainText}>Tap to add</Text>
                                <Text style={styles.uploadSubText}>Recommended (6:9)</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* DESCRIPTION */}
                    <Text style={styles.label}>Description</Text>
                    <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start', paddingVertical: 10 }]}>
                        <TextInput
                            style={[styles.wrapperInput, styles.textAreaInput]}
                            placeholder="Provide a detailed description..."
                            placeholderTextColor='#BBB'
                            multiline
                            numberOfLines={4}
                            onChangeText={(val) => setForm({...form, description: val})}
                        />
                    </View>
                </View>
                
                {/* DATE & LOCATION CARD */}
                <View style={styles.card}>
                    <Text style={styles.cardSectionTitle}>DATE & LOCATION</Text>
                    <View style={styles.selectorRow}>
                        <TouchableOpacity
                            style={styles.dateTimeSelector}
                            onPress={() => setShowStartPicker(true)}>
                            <Ionicons name="calendar-clear-outline" size={18} color="#1a2a44" />
                            <Text style={styles.selectorMainText}>{form.event_date ? form?.event_date : "Start Date"}</Text>
                        </TouchableOpacity>

                        {/* Nút chọn End Date */}
                        <TouchableOpacity
                            style={styles.dateTimeSelector}
                            onPress={() => setShowEndPicker(true)}
                        >
                            <Ionicons name="time-outline" size={18} color="#1a2a44" />
                            <Text style={styles.selectorMainText}>{form.end_date ? form?.end_date : "End Date"}</Text>
                        </TouchableOpacity>
                        {showStartPicker && (
                            <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display="calendar"
                            onChange={(event, selectedDate) => {
                                setShowStartPicker(false);
                                if (selectedDate) {
                                setForm({ ...form, event_date: selectedDate.toISOString() });
                                }
                            }}
                            />
                        )}

                        {showEndPicker && (
                            <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display="calendar"
                            onChange={(event, selectedDate) => {
                                setShowEndPicker(false);
                                if (selectedDate) {
                                setForm({ ...form, end_date: selectedDate.toISOString() });
                                }
                            }}
                            />
                        )}
                        </View>
                    <View style={styles.inputWrapper}>
                        <TextInput 
                            style={styles.wrapperInput}
                            placeholder="Venue / Location"
                            placeholderTextColor='#BBB'
                            onChangeText={(val) => setForm({...form, location_url: val})}
                        />
                    </View>
                </View>


                {/* CAPACITY & PRICE */}
                <View style={styles.card}>
                    <Text style={styles.cardSectionTitle}>CAPACITY & TICKETING</Text>
                    <View style={styles.ticketRow}>
                        <View style={[styles.inputWrapper, {flex: 1, marginRight: 10}]}>
                            <TextInput 
                                style={styles.wrapperInput}
                                placeholder="Capacity"
                                placeholderTextColor='#BBB'
                                keyboardType="numeric"
                                onChangeText={(val) => setForm({...form, max_attendees: Number(val)})}
                            />
                        </View>
                        <View style={[styles.inputWrapper, {flex: 1}]}>
                            <Text style={{fontWeight: 'bold', fontSize: 16, color: '#1a2a44'}}>$</Text>
                            <TextInput 
                                style={[styles.wrapperInput, {marginLeft: 5}]}
                                placeholder="Price"
                                placeholderTextColor='#BBB'
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                {/* ACTIONS */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.btnSecondary}>
                        <Text style={styles.btnSecondaryText}>Save Draft</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnPrimary} onPress={handlePublish}>
                        <Text style={styles.btnPrimaryText}>Publish</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

function createStyles() {
    return StyleSheet.create({
        mainContainer: {
            flex: 1,
            backgroundColor: '#F0F3F7', 
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: 16,
            paddingBottom: 40,
        },
        header: {
            backgroundColor: Colors.color.primary,
            paddingTop: 50,
            paddingBottom: 20,
            paddingHorizontal: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
        },
        headerText: {
            fontSize: 20,
            fontWeight: '700',
            textAlign: 'center',
            color: 'white',
            letterSpacing: 1,
        },
        card: {
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
                android: { elevation: 2 }
            }),
        },
        cardSectionTitle: {
            fontSize: 12,
            marginBottom: 15,
            fontWeight: '800',
            color: '#AAA', 
            letterSpacing: 1.2,
        },
        label: {
            fontSize: 14,
            marginBottom: 8,
            fontWeight: '600',
            color: '#555',
        },

        // INPUT WRAPPERS
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F5F7FA',
            borderRadius: 10,
            paddingHorizontal: 12,
            marginBottom: 15,
            borderBottomWidth: 1,
            borderColor: '#E6E9EE',
        },
        wrapperInput: {
            flex: 1,
            height: 48,
            fontSize: 15,
            color: '#333',
        },
        textAreaInput: {
            textAlignVertical: 'top',
        },

        // IMAGE PICKER
        imageContainer: {
            height: 120,
            borderWidth: 1,
            borderColor: '#cccccccb',
            borderStyle: 'dashed',
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            overflow: 'hidden',
            backgroundColor: '#FFF',
        },
        imageActive: {
            borderStyle: 'solid',
            borderColor: '#1a2a44',
        },
        uploadPlaceholder: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        cameraCircle: {
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: '#1a2a44',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
        },
        uploadMainText: {
            fontSize: 14,
            color: '#333',
            fontWeight: '600',
        },
        uploadSubText: {
            fontSize: 12,
            color: '#888',
            marginTop: 2,
        },
        previewImage: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },

        // DATE
        selectorRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 15,
        },
        dateTimeSelector: {
            flex: 0.48,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F5F7FA',
            padding: 14,
            borderRadius: 10,
        },
        selectorMainText: {
            marginLeft: 8,
            fontSize: 14,
            fontWeight: '600',
            color: '#1a2a44',
        },
        
        // TICKETING
        ticketRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },

        // ACTIONS
        footer: {
            flexDirection: 'row',
            marginTop: 10,
            marginBottom: 40,
        },
        btnPrimary: {
            flex: 1.5,
            backgroundColor: Colors.color.primary,
            padding: 18,
            borderRadius: 12,
            alignItems: 'center',         
        },
        btnSecondary: {
            flex: 1,
            borderWidth: 1,
            borderColor: '#001F3F',
            padding: 18,
            borderRadius: 12,
            alignItems: 'center',
            marginRight: 10,
        },
        btnPrimaryText: {
            color: 'white',
            fontSize: 16,
            fontWeight: '700',
        },
        btnSecondaryText: {
            color: Colors.color.primary,
            fontSize: 15,
            fontWeight: '700',
        }
    });
}