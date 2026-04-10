import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';

// Dữ liệu mẫu
const speakers = [
  { id: '1', name: 'Kim Jisoo', role: 'AI Expert', img: 'https://tse3.mm.bing.net/th/id/OIP.cRjV5n4L0G9MtaWKbS3PUQHaNK?rs=1&pid=ImgDetMain&o=7&rm=3' },
  { id: '2', name: 'Jang Won-young', role: 'AI Expert', img: 'https://th.bing.com/th/id/OSK.cBFp5a8GSyrienSlKkMaFE_Bh8Rcb8nV0EmXH80ToDE?w=200&h=200&c=12&o=6&dpr=1.3&pid=SANGAM' },
  { id: '3', name: 'Go Youn-jung', role: 'Director', img: 'https://th.bing.com/th/id/OIP.I2n_XlYSdyKXOUkAtfeLSgHaJh?w=208&h=268&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3' },
  { id: '4', name: 'Kim Ji-won', role: 'Speaker', img: 'https://media-cdn-v2.laodong.vn/storage/newsportal/2024/3/19/1317075/Kim-Ji-Won-8.jpg' },
];

const sponsors = [
  { id: '1', img: 'https://th.bing.com/th/id/OIP.awyTkpkOsZJjYt7Qgcv73AHaEK?w=320&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3' },
  { id: '2', img: 'https://th.bing.com/th/id/R.681caf025e059780e4dcdf5f03722e77?rik=0b8TB7kvASFtZA&pid=ImgRaw&r=0' },
  { id: '3', img: 'https://static.vecteezy.com/system/resources/previews/021/972/603/original/minsk-belarus-03-27-2023-openai-and-chatgpt-logo-artifical-chatbot-system-chat-bot-button-for-web-app-and-phone-icon-symbol-editorial-illustration-free-vector.jpg' },
  { id: '4', img: 'https://tse4.mm.bing.net/th/id/OIP._Wfo7QpuwP4YJhoKZ2KHmwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3' },
];

export default function EventDetailsScreen() {
  const router = useRouter();
  const themeColor = Colors.light.tint; // Màu Navy
  const EVENT_LOCATION = "Gigamall, 240-242 Phạm Văn Đồng, Hiệp Bình Chánh, Thủ Đức, Hồ Chí Minh";

  const handleOpenMap = () => {
    const encodedLocation = encodeURIComponent(EVENT_LOCATION);
    const url = Platform.select({
      ios: `maps://0,0?q=${encodedLocation}`,
      android: `geo:0,0?q=${encodedLocation}`,
    });
    if (url) Linking.openURL(url);
  };

  const handleShare = () => {
    Share.share({ message: `Tham gia International Tech Summit 2024 tại Gigamall cùng mình nhé!` });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: 'white' }} edges={['top']} />
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View style={[styles.blueHeader, { backgroundColor: themeColor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <FontAwesome5 name="building" size={20} color="white" style={{ marginLeft: 15 }} />
          <Text style={styles.headerTitle}>EVENT CONNECT</Text>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color="white" />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: 'https://uploads-ssl.webflow.com/6238fb9311591cfbce305e81/6272115ac02a5c7c4b7c78b4_CEG-open-graph.jpeg' }}
          style={styles.banner}
        />

        <View style={styles.content}>
          <Text style={[styles.mainTitle, { color: themeColor }]}>International Tech Summit 2024</Text>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar-month" size={28} color={themeColor} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Event Timeline (Time & Date)</Text>
              <Text style={styles.infoValue}>October 12-14, 2026 | 9:00 AM - 5:00 PM</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-sharp" size={28} color={themeColor} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{EVENT_LOCATION}</Text>
            </View>
          </View>

          <View style={styles.mapContainer}>
            <View style={[styles.mapFrame, { backgroundColor: '#f5f5f5' }]} />
            <TouchableOpacity style={styles.mapButton} onPress={handleOpenMap} activeOpacity={0.7}>
              <Ionicons name="map-outline" size={16} color="#007AFF" />
              <Text style={styles.mapButtonText}>Open in Maps</Text>
            </TouchableOpacity>
            <View style={styles.mapPin}>
              <Ionicons name="location" size={36} color="red" />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
               <Ionicons name="information-circle" size={24} color={themeColor} />
               <Text style={styles.sectionTitle}>About the Event</Text>
            </View>
            <Text style={styles.bodyText}>
              Join us for the most anticipated tech summit of 2024, featuring world-class speakers and cutting-edge innovations in AI and Software Engineering.
            </Text>
          </View>

          <Text style={[styles.sectionTitle, {marginTop: 25}]}>Key Speakers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.speakerList}>
            {speakers.map((s) => (
              <View key={s.id} style={styles.speakerCard}>
                <Image source={{ uri: s.img }} style={styles.speakerImg} />
                <Text style={styles.speakerName}>{s.name}</Text>
                <Text style={styles.speakerRole}>{s.role}</Text>
                <TouchableOpacity style={styles.profileTag}>
                  <Text style={[styles.profileTagText, { color: themeColor }]}>Speaker Profile</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.section}>
             <View style={styles.sectionHeaderRow}>
                <Ionicons name="person" size={20} color={themeColor} />
                <Text style={styles.sectionTitle}>Host/Organization</Text>
             </View>
             <Text style={styles.hostName}>Tech Innovations Global</Text>
             <Text style={styles.bodyText}>Leading organizer of international technology conferences across South East Asia, focused on digital transformation.</Text>
          </View>

          <View style={styles.section}>
             <View style={styles.sectionHeaderRow}>
                <MaterialCommunityIcons name="ticket-confirmation" size={22} color={themeColor} />
                <Text style={styles.sectionTitle}>Ticket Information</Text>
             </View>
             <Text style={styles.bodyText}>• Standard Pass: Free access to all main sessions.{"\n"}• Premium Pass: Access to VIP networking and workshops.</Text>
          </View>

          <Text style={[styles.sectionTitle, {marginTop: 25}]}>Sponsors</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sponsorList}>
            {sponsors.map((sp) => (
              <View key={sp.id} style={styles.sponsorCard}>
                <Image source={{ uri: sp.img }} style={styles.sponsorImg} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
            style={[styles.regBtn, { backgroundColor: themeColor }]}
            onPress={() => router.push('/registration_form')}
        >
          <Text style={styles.regBtnText}>REGISTER NOW</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  blueHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10, letterSpacing: 1 },
  shareBtn: { flexDirection: 'row', alignItems: 'center' },
  shareBtnText: { color: 'white', marginLeft: 5, fontSize: 14 },

  scrollBody: { paddingBottom: 110 },
  banner: { width: '100%', height: 200, resizeMode: 'cover' },
  content: { padding: 20 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  infoRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  infoTextGroup: { marginLeft: 12, flex: 1 },
  infoLabel: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  infoValue: { color: '#666', marginTop: 3, fontSize: 13 },

  mapContainer: { width: '100%', height: 150, borderRadius: 15, overflow: 'hidden', marginVertical: 15, borderWidth: 1, borderColor: '#eee', position: 'relative' },
  mapFrame: { width: '100%', height: '100%' },
  mapButton: {
    position: 'absolute', top: 12, left: 12, backgroundColor: 'white', flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 5,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, zIndex: 10
  },
  mapButtonText: { color: '#007AFF', fontSize: 12, marginLeft: 5, fontWeight: 'bold' },
  mapPin: { position: 'absolute', top: '35%', left: '46%' },

  section: { marginTop: 25 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginLeft: 8, color: '#333' },
  bodyText: { color: '#666', lineHeight: 20, fontSize: 13 },
  hostName: { fontWeight: 'bold', color: '#333', fontSize: 14, marginBottom: 5 },

  speakerList: { marginTop: 15 },
  speakerCard: { alignItems: 'center', marginRight: 15, width: 90 },
  speakerImg: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#eee' },
  speakerName: { fontWeight: 'bold', fontSize: 11, textAlign: 'center', marginTop: 8 },
  speakerRole: { fontSize: 10, color: '#888' },
  profileTag: { backgroundColor: '#E1E9F4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 6 },
  profileTagText: { fontSize: 9, fontWeight: 'bold' },

  sponsorList: { marginTop: 10, paddingVertical: 10 },
  sponsorCard: { marginRight: 25, justifyContent: 'center' },
  sponsorImg: { width: 80, height: 40 },

  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' },
  regBtn: { padding: 16, borderRadius: 30, alignItems: 'center' },
  regBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});