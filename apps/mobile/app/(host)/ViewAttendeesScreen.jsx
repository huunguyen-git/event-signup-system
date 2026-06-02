import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import apiClient from "@/axios/axios";
import { getToken } from "@/services/storage";
import { getSocket } from "@/services/socket";

const STATUS_TABS = [
  { value: "All", label: "ALL" },
  { value: "PENDING", label: "PENDING" },
  { value: "APPROVED", label: "APPROVED" },
  { value: "REJECTED", label: "REJECTED" },
  { value: "WAITLISTED", label: "WAITLISTED" }
];

export default function ViewAttendeesScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const response = await apiClient.get(`/events/${id}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendees(response.data || []);
    } catch (error) {
      console.log("Lỗi fetch attendees:", error);
      Alert.alert("Lỗi", "Không thể lấy danh sách người đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAttendees();

      const socket = getSocket();
      socket.on("applications_changed", fetchAttendees);

      return () => {
        socket.off("applications_changed", fetchAttendees);
      };
    }
  }, [id]);

  const filteredAttendees = attendees.filter((item) => {
    const matchStatus = activeTab === "All" || item.status === activeTab;
    const matchSearch = item.user?.full_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const toggleSelect = (applicationId) => {
    if (selectedIds.includes(applicationId)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== applicationId));
    } else {
      setSelectedIds([...selectedIds, applicationId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAttendees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAttendees.map((a) => a.id));
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (selectedIds.length === 0) return;

    try {
      const token = await getToken();
      await apiClient.patch(
        `/applications/bulk-update-status`,
        { ids: selectedIds, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Thành công", `Đã chuyển sang ${newStatus}`);
      setSelectedIds([]);
      fetchAttendees();
    } catch (error) {
      console.log("Lỗi update status:", error);
      Alert.alert("Lỗi", "Cập nhật thất bại.");
    }
  };

  const renderAttendee = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);

    let statusBg = "#F3F4F6";
    let statusTextColor = "#6B7280";
    let statusLabel = item.status || "UNKNOWN";

    if (item.status === "APPROVED") {
      statusBg = "#E8F5E9";
      statusTextColor = "#2E7D32";
      statusLabel = "APPROVED";
    } else if (item.status === "PENDING") {
      statusBg = "#E3F2FD";
      statusTextColor = "#1565C0";
      statusLabel = "PENDING";
    } else if (item.status === "REJECTED") {
      statusBg = "#FFEBEE";
      statusTextColor = "#C62828";
      statusLabel = "REJECTED";
    } else if (item.status === "WAITLISTED") {
      statusBg = "#FFF3E0";
      statusTextColor = "#EF6C00";
      statusLabel = "WAITLISTED";
    }

    return (
      <View style={styles.attendeeRow}>
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.checkbox} onPress={() => toggleSelect(item.id)}>
            {isSelected && <View style={styles.checkboxInner} />}
          </TouchableOpacity>
          {item.user?.avatar_url ? (
            <Image
              source={{ uri: item.user.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: "#e1e4e8", justifyContent: "center", alignItems: "center" }]}>
              <Ionicons name="person" size={20} color="#a3a6ac" />
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <CustomText variant="bold" style={styles.nameText}>
              {item.user?.full_name || "Unknown User"}
            </CustomText>
            {item.checked_in && (
              <View style={styles.checkedInBadge}>
                <Ionicons name="checkmark" size={10} color="#2E7D32" />
                <CustomText variant="bold" style={styles.checkedInText}>
                  Checked-in
                </CustomText>
              </View>
            )}
          </View>
          <CustomText style={styles.eventText}>{item.user?.email}</CustomText>
        </View>

        <View style={styles.rightSection}>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <CustomText variant="bold" style={[styles.statusText, { color: statusTextColor }]}>
              {statusLabel}
            </CustomText>
          </View>
        </View>
      </View>
    );
  };

  const styles = createStyles();
  const isAllSelected = filteredAttendees.length > 0 && selectedIds.length === filteredAttendees.length;

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <CustomText variant="bold" style={styles.headerText}>
          ATTENDEES ({filteredAttendees.length})
        </CustomText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchBarRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor={Colors.color.placeholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === item.value && styles.tabBtnActive]}
              onPress={() => {
                setActiveTab(item.value);
                setSelectedIds([]);
              }}
            >
              <CustomText variant={activeTab === item.value ? "bold" : "medium"} style={[styles.tabText, activeTab === item.value && styles.tabTextActive]}>
                {item.label}
              </CustomText>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.listHeaderRow}>
        <TouchableOpacity style={{ flex: 0.2, flexDirection: "row", alignItems: "center" }} onPress={toggleSelectAll}>
            <View style={styles.checkbox}>
              {isAllSelected && <View style={styles.checkboxInner} />}
            </View>
            <CustomText variant="bold" style={styles.listHeaderText}>All</CustomText>
        </TouchableOpacity>
        <CustomText variant="bold" style={[styles.listHeaderText, { flex: 0.5 }]}>Info</CustomText>
        <CustomText variant="bold" style={[styles.listHeaderText, { flex: 0.3, textAlign: "right" }]}>Status</CustomText>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.color.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredAttendees}
          keyExtractor={(item) => item.id}
          renderItem={renderAttendee}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <CustomText style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>
              No applications found.
            </CustomText>
          }
        />
      )}

      {selectedIds.length > 0 && (
        <View style={styles.footer}>
          <CustomText variant="bold" style={styles.managementTitle}>
            Action for {selectedIds.length} selected
          </CustomText>
          <View style={styles.actionScroll}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#4CAF50", flex: 1 }]}
              onPress={() => handleUpdateStatus("APPROVED")}
            >
              <Ionicons name="checkmark-circle" size={18} color="white" style={{ marginRight: 5 }} />
              <CustomText variant="bold" style={styles.actionBtnText}>APPROVE</CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#F44336", flex: 1 }]}
              onPress={() => handleUpdateStatus("REJECTED")}
            >
              <Ionicons name="close-circle" size={18} color="white" style={{ marginRight: 5 }} />
              <CustomText variant="bold" style={styles.actionBtnText}>REJECT</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: "#F8F9FA" },
    header: {
      backgroundColor: Colors.color.primary,
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerText: { color: "white", fontSize: 16 },
    searchBarRow: { flexDirection: "row", padding: 15 },
    searchContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "white",
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 45,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },

    tabBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: "#EEE",
      marginRight: 10,
    },
    tabBtnActive: { backgroundColor: Colors.color.primary },
    tabText: { fontSize: 13, color: "#666" },
    tabTextActive: { color: "white" },

    listHeaderRow: {
      flexDirection: "row",
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: "#FFF",
      borderBottomWidth: 1,
      borderBottomColor: "#EEE",
      alignItems: 'center'
    },
    listHeaderText: { fontSize: 12, color: "#888", marginLeft: 5 },

    attendeeRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      backgroundColor: "white",
      borderBottomWidth: 1,
      borderBottomColor: "#F0F0F0",
    },
    leftSection: { flex: 0.2, flexDirection: "row", alignItems: "center" },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: "#DDD",
      borderRadius: 4,
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center'
    },
    checkboxInner: {
      width: 10,
      height: 10,
      backgroundColor: Colors.color.primary,
      borderRadius: 2,
    },
    avatar: { width: 35, height: 35, borderRadius: 17.5 },
    infoSection: { flex: 0.5, paddingHorizontal: 5 },
    nameText: { fontSize: 14, color: "#333" },
    eventText: { fontSize: 11, color: "#999" },
    rightSection: { flex: 0.3, alignItems: "flex-end" },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: { fontSize: 10, color: "white" },
    checkedInBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#E8F5E9",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#C8E6C9",
    },
    checkedInText: {
      fontSize: 9,
      color: "#2E7D32",
      marginLeft: 2,
    },

    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "white",
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: "#EEE",
      paddingBottom: 30,
    },
    managementTitle: { fontSize: 14, marginBottom: 10, color: "#333", textAlign: 'center' },
    actionScroll: { flexDirection: "row", justifyContent: 'space-between', gap: 10 },
    actionBtn: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 8,
    },
    actionBtnText: { color: "white", fontSize: 14 },
  });
}