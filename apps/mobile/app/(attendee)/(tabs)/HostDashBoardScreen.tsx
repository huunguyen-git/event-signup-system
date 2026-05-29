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

const STATUS_TABS = ["All", "DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"];

export default function HostDashboardScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [data, setData] = useState<ICreateEvent[]>([]);
  const router = useRouter();

  // Kéo hàm fetch ra ngoài để có thể gọi lại (truyền vào onRefresh)
  const fetchEvents = async () => {
    const events = await EventService.getEvents();
    const userId = (await getUserId()) ?? "";
    setData(events.filter((item: ICreateEvent) => item.host_id === userId));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filterData = useMemo(() => {
    let filtered = data;

    if (activeTab !== "All") {
      filtered = filtered.filter((item) => item.status?.toUpperCase() === activeTab);
    }

    if (searchQuery) {
      const formatQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => item.title.toLowerCase().includes(formatQuery));
    }
    return filtered;
  }, [searchQuery, activeTab, data]);

  const styles = createStyles();

  const renderHeader = () => {
    return (
      <View style={styles.listHeader}>
        <CustomText variant="bold" style={styles.sectionTitle}>
          HOST DASHBOARD
        </CustomText>

        <View style={styles.tabsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={STATUS_TABS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === item && styles.tabBtnActive]}
                onPress={() => setActiveTab(item)}
              >
                <CustomText variant={activeTab === item ? "bold" : "medium"} style={[styles.tabText, activeTab === item && styles.tabTextActive]}>
                  {item}
                </CustomText>
              </TouchableOpacity>
            )}
          />
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
          placeholder="Search by event name..."
          placeholderTextColor={Colors.color.placeholder}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filterData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HostEventItem event={item} onRefresh={fetchEvents} />}
        ListHeaderComponent={renderHeader}
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
          Create a new event
        </CustomText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function createStyles() {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.color.background || "#F8F9FA" },
    searchContainer: {
      flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 25,
      alignItems: "center", paddingHorizontal: 15, height: 45,
      marginVertical: 15, marginHorizontal: 20,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
    },
    searchInput: { flex: 1, color: "#333", fontSize: 16, marginLeft: 10 },
    listHeader: { paddingVertical: 10 },
    sectionTitle: { fontSize: 26, color: "#1B2B52", marginBottom: 15, paddingHorizontal: 20 },
    tabsContainer: { paddingLeft: 20, marginBottom: 10 },
    tabBtn: {
      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
      backgroundColor: "#EEE", marginRight: 10,
    },
    tabBtnActive: { backgroundColor: Colors.color.primary },
    tabText: { fontSize: 13, color: "#666" },
    tabTextActive: { color: "white" },
    createButton: {
      flexDirection: "row", justifyContent: "center", alignItems: "center",
      position: "absolute", bottom: 20, right: 20,
      backgroundColor: Colors.color.primary, paddingVertical: 14, paddingHorizontal: 20,
      borderRadius: 30, elevation: 6,
    },
    createButtonText: { fontSize: 16, color: "white", marginLeft: 6 },
    scrollPadding: { paddingBottom: 100 },
  });
}