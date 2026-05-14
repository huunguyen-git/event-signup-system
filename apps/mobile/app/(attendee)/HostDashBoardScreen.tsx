import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Search, Bell, User } from "lucide-react-native";
import { Colors } from "../../constants/theme";
import StatCard from "../../components/StatCard";
import HostEventItem from "../../components/HostEventItem";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { EventService } from "@/axios/eventService";
import { useRouter } from "expo-router";

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
        <Text style={styles.sectionTitle}>HOST DASHBOARD</Text>

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

      <View style={styles.topHeader}>
        <View style={styles.headerRow}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="domain"
              size={50}
              color={Colors.color.white}
            />
            <Text style={styles.logoTextMain}>EVENT </Text>
            <Text style={styles.logoTextSub}>CONNECT</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <User size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color="#8E8E93" />
        <TextInput
          placeholder="Search events or stats..."
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
        <Text style={styles.createButtonText}>Create new event</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function createStyles() {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "white",
    },
    topHeader: {
      backgroundColor: Colors.color.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      elevation: 10,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 10,
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
      fontWeight: "600",
      letterSpacing: 0.5,
      marginLeft: 10,
    },
    logoTextSub: {
      color: "white",
      fontSize: 20,
      fontWeight: "300",
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
      backgroundColor: "#cde0f9",
      borderRadius: 25,
      alignItems: "center",
      paddingHorizontal: 15,
      height: 40,
      marginVertical: 15,
      marginHorizontal: 20,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
    },
    listHeader: {
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 26,
      fontWeight: "900",
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
      bottom: 10,
      right: 5,
      backgroundColor: Colors.color.primary,
      padding: 15,
      borderRadius: 30,
    },
    createButtonText: {
      fontSize: 16,
      color: "white",
      fontWeight: 600,
      marginLeft: 5,
    },
    scrollPadding: {
      paddingBottom: 100,
      paddingHorizontal: 20,
    },
  });
}
