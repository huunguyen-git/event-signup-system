import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar,
  Linking,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { EventService } from "@/axios/eventService";
import { ICreateEvent } from "@/axios/dto/eventModel";

// Dữ liệu mẫu
const speakers = [
  {
    id: "1",
    name: "Kim Jisoo",
    role: "AI Expert",
    img: "https://tse3.mm.bing.net/th/id/OIP.cRjV5n4L0G9MtaWKbS3PUQHaNK?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "2",
    name: "Jang Won-young",
    role: "AI Expert",
    img: "https://th.bing.com/th/id/OSK.cBFp5a8GSyrienSlKkMaFE_Bh8Rcb8nV0EmXH80ToDE?w=200&h=200&c=12&o=6&dpr=1.3&pid=SANGAM",
  },
  {
    id: "3",
    name: "Go Youn-jung",
    role: "Director",
    img: "https://th.bing.com/th/id/OIP.I2n_XlYSdyKXOUkAtfeLSgHaJh?w=208&h=268&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
  },
  {
    id: "4",
    name: "Kim Ji-won",
    role: "Speaker",
    img: "https://media-cdn-v2.laodong.vn/storage/newsportal/2024/3/19/1317075/Kim-Ji-Won-8.jpg",
  },
];

const sponsors = [
  {
    id: "1",
    img: "https://th.bing.com/th/id/OIP.awyTkpkOsZJjYt7Qgcv73AHaEK?w=320&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
  },
  {
    id: "2",
    img: "https://th.bing.com/th/id/R.681caf025e059780e4dcdf5f03722e77?rik=0b8TB7kvASFtZA&pid=ImgRaw&r=0",
  },
  {
    id: "3",
    img: "https://static.vecteezy.com/system/resources/previews/021/972/603/original/minsk-belarus-03-27-2023-openai-and-chatgpt-logo-artifical-chatbot-system-chat-bot-button-for-web-app-and-phone-icon-symbol-editorial-illustration-free-vector.jpg",
  },
  {
    id: "4",
    img: "https://tse4.mm.bing.net/th/id/OIP._Wfo7QpuwP4YJhoKZ2KHmwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
];

export default function EventDetailsScreen() {
  const router = useRouter();
  const themeColor = Colors.light.tint; // Màu Navy
  const EVENT_LOCATION =
    "Gigamall, 240-242 Phạm Văn Đồng, Hiệp Bình Chánh, Thủ Đức, Hồ Chí Minh";
  const { id } = useLocalSearchParams();
  const [eventData, setEventData] = useState<ICreateEvent | null>(null);
  const [datePart, setDatePart] = useState("");
  const [timePart, setTimePart] = useState("");

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        const data = await EventService.getEvent(id);
        setEventData(data);
        const eventdate = new Date(data.event_date);

        const date = new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(eventdate);

        const time = new Intl.DateTimeFormat("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(eventdate);
        setDatePart(date);
        setTimePart(time);
      };
      fetchData();
    }
  }, [id]);

  const handleOpenMap = () => {
    const encodedLocation = encodeURIComponent(
      eventData ? eventData.location_url : EVENT_LOCATION,
    );
    const url = Platform.select({
      ios: `maps://0,0?q=${encodedLocation}`,
      android: `geo:0,0?q=${encodedLocation}`,
    });
    if (url) Linking.openURL(url);
  };

  const handleShare = () => {
    router.push({
      pathname: "/ShowQrScreen",
      params: { id: eventData?.id, title: eventData?.title },
    });
  };
  const handleRegister = () => {
    router.push({
      pathname: "/RegistrationFormScreen",
      params: {
        id: eventData?.id,
        isCreate: "false",
      },
    });
  };
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: "white" }} edges={["top"]} />
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View style={[styles.blueHeader, { backgroundColor: themeColor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <FontAwesome5
            name="building"
            size={20}
            color="white"
            style={{ marginLeft: 15 }}
          />
          <CustomText variant="bold" style={styles.headerTitle}>EVENT CONNECT</CustomText>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color="white" />
          <CustomText style={styles.shareBtnText}>Share</CustomText>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={
            eventData?.banner_url
              ? { uri: eventData.banner_url }
              : require("../assets/images/icon.png")
          }
          style={styles.banner}
        />

        <View style={styles.content}>
          <CustomText variant="bold" style={[styles.mainTitle, { color: themeColor }]}>
            {eventData?.title}
          </CustomText>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="calendar-month"
              size={28}
              color={themeColor}
            />
            <View style={styles.infoTextGroup}>
              <CustomText variant="bold" style={styles.infoLabel}>Event Timeline (Time & Date)</CustomText>
              <CustomText style={styles.infoValue}>
                {datePart} - {timePart}
              </CustomText>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-sharp" size={28} color={themeColor} />
            <View style={styles.infoTextGroup}>
              <CustomText variant="bold" style={styles.infoLabel}>Location</CustomText>
              <CustomText style={styles.infoValue}>
                {eventData?.location_url || EVENT_LOCATION}
              </CustomText>
            </View>
          </View>

          <View style={styles.mapContainer}>
            <View style={[styles.mapFrame, { backgroundColor: "#f5f5f5" }]} />
            <TouchableOpacity
              style={styles.mapButton}
              onPress={handleOpenMap}
              activeOpacity={0.7}
            >
              <Ionicons name="map-outline" size={16} color="#007AFF" />
              <CustomText variant="bold" style={styles.mapButtonText}>Open in Maps</CustomText>
            </TouchableOpacity>
            <View style={styles.mapPin}>
              <Ionicons name="location" size={36} color="red" />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons
                name="information-circle"
                size={24}
                color={themeColor}
              />
              <CustomText variant="bold" style={styles.sectionTitle}>About the Event</CustomText>
            </View>
            <CustomText style={styles.bodyText}>
              Join us for the most anticipated tech summit of 2024, featuring
              world-class speakers and cutting-edge innovations in AI and
              Software Engineering.
            </CustomText>
          </View>

          <CustomText variant="bold" style={[styles.sectionTitle, { marginTop: 25 }]}>
            Key Speakers
          </CustomText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.speakerList}
          >
            {speakers.map((s) => (
              <View key={s.id} style={styles.speakerCard}>
                <Image source={{ uri: s.img }} style={styles.speakerImg} />
                <CustomText variant="bold" style={styles.speakerName}>{s.name}</CustomText>
                <CustomText style={styles.speakerRole}>{s.role}</CustomText>
                <TouchableOpacity style={styles.profileTag}>
                  <CustomText variant="bold" style={[styles.profileTagText, { color: themeColor }]}>
                    Speaker Profile
                  </CustomText>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="person" size={20} color={themeColor} />
              <CustomText variant="bold" style={styles.sectionTitle}>Host/Organization</CustomText>
            </View>
            <CustomText variant="bold" style={styles.hostName}>Tech Innovations Global</CustomText>
            <CustomText style={styles.bodyText}>
              Leading organizer of international technology conferences across
              South East Asia, focused on digital transformation.
            </CustomText>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons
                name="ticket-confirmation"
                size={22}
                color={themeColor}
              />
              <CustomText variant="bold" style={styles.sectionTitle}>Ticket Information</CustomText>
            </View>
            <CustomText style={styles.bodyText}>
              • Standard Pass: Free access to all main sessions.{"\n"}• Premium
              Pass: Access to VIP networking and workshops.
            </CustomText>
          </View>

          <CustomText variant="bold" style={[styles.sectionTitle, { marginTop: 25 }]}>Sponsors</CustomText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sponsorList}
          >
            {sponsors.map((sp) => (
              <View key={sp.id} style={styles.sponsorCard}>
                <Image
                  source={{ uri: sp.img }}
                  style={styles.sponsorImg}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.regBtn, { backgroundColor: themeColor }]}
          onPress={handleRegister}
        >
          <CustomText variant="bold" style={styles.regBtnText}>REGISTER NOW</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  blueHeader: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
    letterSpacing: 1,
  },
  shareBtn: { flexDirection: "row", alignItems: "center" },
  shareBtnText: { color: "white", marginLeft: 5, fontSize: 14 },

  scrollBody: { paddingBottom: 110 },
  banner: { width: "100%", height: 200, resizeMode: "cover" },
  content: { padding: 20 },
  mainTitle: { fontSize: 22, marginBottom: 20 },
  infoRow: { flexDirection: "row", marginBottom: 15, alignItems: "center" },
  infoTextGroup: { marginLeft: 12, flex: 1 },
  infoLabel: { fontSize: 15, color: "#333" },
  infoValue: { color: "#666", marginTop: 3, fontSize: 13 },

  mapContainer: {
    width: "100%",
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 15,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    position: "relative",
  },
  mapFrame: { width: "100%", height: "100%" },
  mapButton: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 10,
  },
  mapButtonText: {
    color: "#007AFF",
    fontSize: 12,
    marginLeft: 5,
  },
  mapPin: { position: "absolute", top: "35%", left: "46%" },

  section: { marginTop: 25 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    marginLeft: 8,
    color: "#333",
  },
  bodyText: { color: "#666", lineHeight: 20, fontSize: 13 },
  hostName: {
    color: "#333",
    fontSize: 14,
    marginBottom: 5,
  },

  speakerList: { marginTop: 15 },
  speakerCard: { alignItems: "center", marginRight: 15, width: 90 },
  speakerImg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#eee",
  },
  speakerName: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
  speakerRole: { fontSize: 10, color: "#888" },
  profileTag: {
    backgroundColor: "#E1E9F4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  profileTagText: { fontSize: 9 },

  sponsorList: { marginTop: 10, paddingVertical: 10 },
  sponsorCard: { marginRight: 25, justifyContent: "center" },
  sponsorImg: { width: 80, height: 40 },

  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  regBtn: { padding: 16, borderRadius: 30, alignItems: "center" },
  regBtnText: { color: "white", fontSize: 16 },
});
