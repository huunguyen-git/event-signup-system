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
import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react-native";
import { Colors } from "../../../constants/theme";
import HostEventItem from "../../../components/HostEventItem";
import { Ionicons } from "@expo/vector-icons";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { EventService } from "@/axios/eventService";
import { useRouter } from "expo-router";
import Header from "@/components/Header";
import { getUserId } from "@/services/storage";

export default function HostDashboardScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<ICreateEvent[]>([]);
  const STATUS_TABS = ["ALL", "PUBLISHED", "DRAFT", "COMPLETE"];
  const [activeTab, setActiveTab] = useState("ALL");
  useEffect(() => {
    const fetchData = async () => {
      const events = await EventService.getEvents();
      const userId = (await getUserId()) ?? "";
      setData(events.filter((item: ICreateEvent) => item.host_id === userId));
    };
    fetchData();
  });
  const styles = createStyles();
  const router = useRouter();
  
  const filterData = useMemo(() => {;

    return data.filter((item) =>{
      const matchStatus = activeTab === "ALL" || item.status === activeTab;
      const matchSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    }
    );
  }, [searchQuery, data, activeTab]);
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
      <View style={styles.listHeader}>
        <CustomText variant="bold" style={styles.sectionTitle}>
          HOST DASHBOARD
        </CustomText>
      </View>
      
      <View>
      <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
            style={[styles.tabBtn, activeTab === item && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab(item);
            }}
            >
              <CustomText variant={activeTab === item ? "bold" : "medium"} style={[styles.tabText, activeTab === item && styles.tabTextActive]}>
                {item}
              </CustomText>
            </TouchableOpacity>
          )}/>
          </View>
      <FlatList
        data={filterData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return <HostEventItem event={item} />;
        }}
        contentContainerStyle={styles.scrollPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <CustomText style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>
              No events found.
            </CustomText>
        }
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push("/CreateEventScreen")}
      >
        <Ionicons name="add" color="white" size={28} />
        <CustomText variant="bold" style={styles.createButtonText}>
          Create new event
        </CustomText>
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
      flex: 1,
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
      marginVertical: 10,
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
    tabBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: "#EEE",
      marginRight: 10,
    },
    tabBtnActive: { 
      backgroundColor: Colors.color.primary 
    },
    tabText: { 
      fontSize: 13, 
      color: "#666" 
    },
    tabTextActive: { 
      color: "white" 
    },
  });
}
