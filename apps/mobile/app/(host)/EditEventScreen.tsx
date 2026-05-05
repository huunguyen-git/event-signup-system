import { useEffect, useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import * as ImagePicker from 'expo-image-picker'
import { ICreateEvent } from '../../axios/dto/eventModel';
import { EventService } from '../../axios/eventService'
import { useLocalSearchParams } from 'expo-router'
import DateTimePicker from "@react-native-community/datetimepicker";

// const eventToEdit = {
//     title: 'International Tech Summit 2023',
//     description: 'International Tech Summit 2023 is a premium event focused on...',
//     location: 'Tech Hub Auditorium, San Francisco',
//     capacity: 150,
//     price: 49.99,
//     status: 'Live',
//     imageUrl: 'https://via.placeholder.com/300x200', 
// };

export default function EditEventScreen() {
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [status, setStatus] = useState('LIVE');
    const {id} = useLocalSearchParams();
    const [event,setEvent] = useState<ICreateEvent>(new ICreateEvent());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    useEffect(()=>{
        const fetchData = async ()=>{
            const data = await EventService.getEvent(id);
            setEvent(data);
        }
        fetchData()
    },[id]);
    const statusOptions = [
    { label: 'LIVE', color: '#4CAF50' },
    { label: 'DRAFT', color: '#FFC107' },
    { label: 'COMPLETE', color: '#2196F3' },
];

    const selectStatus = (val:string) => {
        setStatus(val);
        setIsStatusOpen(false);
    };

    // const [image, setImage] = useState(eventToEdit.imageUrl);
    // const [form, setForm] = useState({
    //     title: eventToEdit.title,
    //     description: eventToEdit.description,
    //     location: eventToEdit.location,
    //     capacity: eventToEdit.capacity.toString(),
    //     price: eventToEdit.price.toString(),
    //     status: eventToEdit.status,
    // });

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [6, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setEvent({...event, banner_url: result.assets[0].uri}); 
        }
    }

    const handleSaveChanges = () => {
        console.log("Submitting UPDATED form to Backend:", event);
        EventService.updateEvent(event.id,event);
    }

    const handleCancel = () => {
        console.log("Cancelling edits and going back...");
    }

    const styles = createStyles();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.mainContainer}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel} style={styles.headerActionBtn}>
                    <Ionicons name="close-outline" size={24} color="#BBB" />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerSubtitle}>Editing Event</Text>
                    <Text style={styles.headerMainTitle} numberOfLines={1}>
                        {event.title}
                    </Text>
                </View>

                <TouchableOpacity onPress={handleSaveChanges} style={styles.headerSaveBtn}>
                    <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                {/*  EVENT STATUS */}
                <View style={styles.card}>
                    <Text style={styles.cardSectionTitle}>EVENT STATUS</Text>
                    
                    {/* DROPDOWN TRIGGER */}
                    <TouchableOpacity 
                        style={styles.statusSelectorRow} 
                        onPress={() => setIsStatusOpen(!isStatusOpen)}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.statusDot, { backgroundColor: statusOptions.find(o => o.label === status)?.color }]} />
                            <Text style={styles.selectorMainText}>{status}</Text>
                        </View>
                        <Ionicons 
                            name={isStatusOpen ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color="#666" 
                        />
                    </TouchableOpacity>

                    {/* THE DROPDOWN MENU */}
                    {isStatusOpen && (
                        <View style={styles.dropdownMenu}>
                            {statusOptions.map((opt) => (
                                <TouchableOpacity 
                                    key={opt.label} 
                                    style={styles.dropdownItem} 
                                    onPress={() => selectStatus(opt.label)}
                                >
                                    <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                                    <Text style={[
                                        styles.dropdownItemText, 
                                        status === opt.label && { fontWeight: '800', color: '#1a2a44' }
                                    ]}>
                                        {opt.label}
                                    </Text>
                                    {status === opt.label && (
                                        <Ionicons name="checkmark" size={18} color="#1a2a44" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* EVENT INFORMATION */}
                <View style={styles.card}>
                    <Text style={styles.cardSectionTitle}>EVENT INFORMATION</Text>
                    
                    <Text style={styles.label}>Event Title</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.wrapperInput}
                            value={event.title}
                            onChangeText={(val) => setEvent({...event, title: val})}
                        />
                    </View>

                    <Text style={styles.label}>Event Image (6:9)</Text>
                    <TouchableOpacity 
                        style={[
                            styles.imageContainer,
                            event.banner_url && styles.imageActive
                        ]}
                        onPress={pickImage} 
                    >
                        {event.banner_url ? (
                            <Image 
                                source={{uri:event.banner_url}} 
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
                    <View style={[styles.inputWrapper, { height: 120, alignItems: 'flex-start', paddingVertical: 10 }]}>
                        <TextInput
                            style={[styles.wrapperInput, styles.textAreaInput]}
                            multiline
                            numberOfLines={4}
                            value={event.description} 
                            onChangeText={(val) => setEvent({...event, description: val})}
                        />
                    </View>
                </View>
                
                {/* DATE & VENUE */}
                <View style={styles.card}>
                    <Text style={styles.cardSectionTitle}>DATE & VENUE</Text>
                    <View style={styles.selectorRow}>
                        <TouchableOpacity
                            style={styles.dateTimeSelector}
                            onPress={() => setShowStartPicker(true)}>
                            <Ionicons name="calendar-clear-outline" size={18} color="#1a2a44" />
                            <Text style={styles.selectorMainText}>{event.event_date ? event?.event_date : "Start Date"}</Text>
                        </TouchableOpacity>

                        {/* Nút chọn End Date */}
                        <TouchableOpacity
                            style={styles.dateTimeSelector}
                            onPress={() => setShowEndPicker(true)}
                        >
                            <Ionicons name="time-outline" size={18} color="#1a2a44" />
                            <Text style={styles.selectorMainText}>{event.end_date ? event?.end_date : "End Date"}</Text>
                        </TouchableOpacity>
                        {showStartPicker && (
                            <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display="calendar"
                            onChange={(date, selectedDate) => {
                                setShowStartPicker(false);
                                if (selectedDate) {
                                setEvent({ ...event, event_date: selectedDate.toISOString() });
                                }
                            }}
                            />
                        )}

                        {showEndPicker && (
                            <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display="calendar"
                            onChange={(date, selectedDate) => {
                                setShowEndPicker(false);
                                if (selectedDate) {
                                setEvent({ ...event, end_date: selectedDate.toISOString() });
                                }
                            }}
                            />
                        )}
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <TextInput 
                            style={styles.wrapperInput}
                            value={event.location_url}
                            onChangeText={(val) => setEvent({...event, location_url: val})}
                        />
                    </View>


                {/* CAPACITY & PRICE */}
                <View style={styles.card}>
                    <Text style={styles.cardSectionTitle}>CAPACITY & TICKETING</Text>
                    <View style={styles.ticketRow}>
                        <View style={[styles.inputWrapper, {flex: 1, marginRight: 10}]}>
                            <TextInput 
                                style={styles.wrapperInput}
                                keyboardType="numeric"
                                value={String(event.max_attendees)} 
                                onChangeText={(val) => setEvent({...event, max_attendees: Number(val)})}
                            />
                        </View>
                        <View style={[styles.inputWrapper, {flex: 1}]}>
                            <Text style={{fontWeight: 'bold', fontSize: 16, color: '#1a2a44'}}>$</Text>
                            <TextInput 
                                style={[styles.wrapperInput, {marginLeft: 5}]}
                                keyboardType="numeric"
                                value="20"
                                // onChangeText={(val) => setForm({...form, price: val})}
                            />
                        </View>
                    </View>
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
            flexDirection: 'row',
            backgroundColor: Colors.color.primary,
            paddingTop: Platform.OS === 'ios' ? 50 : 20,
            paddingBottom: 20,
            paddingHorizontal: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
        },
        headerActionBtn: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'flex-start',
        },
        headerTitleContainer: {
            flex: 1,
            alignItems: 'center',
            paddingHorizontal: 10,
        },
        headerSubtitle: {
            color: '#BBB',
            fontSize: 10,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        headerMainTitle: {
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
        },
        headerSaveBtn: {
            backgroundColor: 'rgba(255,255,255,0.15)',
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderRadius: 10,
        },
        saveBtnText: {
            color: 'white',
            fontSize: 14,
            fontWeight: '700',
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
        ticketRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        statusSelectorRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F5F7FA',
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E6E9EE',
        },
        statusDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 10,
        },
        selectorMainText: {
            marginLeft: 8,
            fontSize: 14,
            fontWeight: '600',
            color: '#1a2a44',
        },

        // DROPDOWN MENU STYLES
        dropdownMenu: {
            backgroundColor: '#FFF',
            marginTop: 5,
            borderRadius: 12,
            padding: 5,
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
                android: { elevation: 5 }
            }),
            borderWidth: 1,
            borderColor: '#EEE',
        },
        dropdownItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            borderRadius: 8,
        },
        dropdownItemText: {
            flex: 1,
            fontSize: 14,
            color: '#666',
        }     
    });
}