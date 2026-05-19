import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Search, Bell, User } from "lucide-react-native";
import { Colors } from "../../../constants/theme";
import StatCard from "../../../components/StatCard";
import HostEventItem from "../../../components/HostEventItem";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { EventService } from "@/axios/eventService";
import { useRouter } from "expo-router";
import Header from "@/components/Header";

export default function HostDashboardScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<ICreateEvent[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const events = await EventService.getEvents();
      setData(events);
    };
    fetchData();
  });
  const styles = createStyles();
  const router = useRouter();
  const renderHeader = () => {
    return (
      <View style={styles.listHeader}>
        <CustomText variant="bold" style={styles.sectionTitle}>HOST DASHBOARD</CustomText>

        <View style={styles.statsGrid}>
          <StatCard
            title="TOTAL ATTENDEES"
            value="1410"
            subtext="replaces previous week"
            trend="+"
          />
          <StatCard title="REVENUE" value="$27.5K" isChart />
          <StatCard title="EVENT FEEDBACK" value="4.7/5" />
          <StatCard title="TICKET SALES" value="1550/2000" progress={77.5} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <Header />

      <View style={styles.searchContainer}>
        <Search size={18} color="#8E8E93" />
        <TextInput
          placeholder="Search events or stats..."
          placeholderTextColor={Colors.color.placeholder}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return <HostEventItem event={item} />;
        }}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.scrollPadding}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push("/CreateEventScreen")}
      >
        <Ionicons name="add" color="white" size={28} />
        <CustomText variant="bold" style={styles.createButtonText}>Create new event</CustomText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function createStyles() {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors.color.background || "#F8F9FA",
    },
    topHeader: {
      backgroundColor: Colors.color.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    logoTextMain: {
      color: "white",
      fontSize: 20,
      letterSpacing: 0.5,
      marginLeft: 10,
    },
    logoTextSub: {
      color: "white",
      fontSize: 20,
      letterSpacing: 0.5,
    },
    headerIcons: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconButton: {
      marginLeft: 15,
    },
    searchContainer: {
      flexDirection: "row",
      backgroundColor: "#FFFFFF",
      borderRadius: 25,
      alignItems: "center",
      paddingHorizontal: 15,
      height: 45,
      marginVertical: 15,
      marginHorizontal: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    },
    searchInput: {
      flex: 1,
      color: "#333",
      fontSize: 16,
    },
    listHeader: {
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 26,
      color: "#1B2B52",
      marginBottom: 15,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    createButton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: Colors.color.primary,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 30,
      shadowColor: Colors.color.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    createButtonText: {
      fontSize: 16,
      color: "white",
      marginLeft: 6,
    },
    scrollPadding: {
      paddingBottom: 100,
      paddingHorizontal: 20,
    },
  });
}
