import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";

const MOCK_ATTENDEES = Array.from({ length: 20 }, (_, i) => ({
  id: i.toString(),
  name: ["Alex Chen", "Jane Smith", "John Doe", "Anne Name"][i % 4],
  event: "WebDev Conf",
  status: i % 3 === 0 ? "Attending" : i % 3 === 1 ? "Check-In" : "Invited",
  ticket: i % 2 === 0 ? "VIP" : "Standard",
  image: `https://i.pravatar.cc/150?u=${i}`,
}));

export default function ViewAttendeesScreen() {
  const [search, setSearch] = useState("");

  const renderAttendee = ({ item }) => (
    <View style={styles.attendeeRow}>
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.checkbox}>
          <View style={styles.checkboxInner} />
        </TouchableOpacity>
        <Image source={{ uri: item.image }} style={styles.avatar} />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.eventText}>{item.event}</Text>
      </View>

      <View style={styles.rightSection}>
        <View
          style={[
            styles.statusBadge,
            styles[`status${item.status.replace("-", "")}`],
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.ticketText}>{item.ticket}</Text>
      </View>
    </View>
  );

  const styles = createStyles();

  return (
    <View style={styles.mainContainer}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>VIEW ALL ATTENDEES (1410 TOTAL)</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* SEARCH & FILTERS */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search attendees..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="funnel-outline" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="swap-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* LIST HEADERS */}
      <View style={styles.listHeaderRow}>
        <Text style={[styles.listHeaderText, { flex: 0.2 }]}>Select</Text>
        <Text style={[styles.listHeaderText, { flex: 0.4 }]}>Event</Text>
        <Text
          style={[styles.listHeaderText, { flex: 0.2, textAlign: "center" }]}
        >
          Status
        </Text>
        <Text
          style={[styles.listHeaderText, { flex: 0.2, textAlign: "right" }]}
        >
          Ticket
        </Text>
      </View>

      {/* THE LIST */}
      <FlatList
        data={MOCK_ATTENDEES}
        keyExtractor={(item) => item.id}
        renderItem={renderAttendee}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* FOOTER ACTIONS */}
      <View style={styles.footer}>
        <Text style={styles.managementTitle}>Management Actions</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.actionScroll}
        >
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Send Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.btnOutline]}>
            <Text style={styles.actionBtnTextOutline}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Check-In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Assign Team</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
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
    headerText: {
      color: "white",
      fontSize: 16,
      fontWeight: "700",
    },

    searchBarRow: {
      flexDirection: "row",
      padding: 15,
      lignItems: "center",
    },
    searchContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#EEE",
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 45,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 14,
    },
    filterBtn: {
      marginLeft: 10,
      padding: 10,
    },

    listHeaderRow: {
      flexDirection: "row",
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: "#FFF",
      borderBottomWidth: 1,
      borderBottomColor: "#EEE",
    },
    listHeaderText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#888",
    },

    attendeeRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      backgroundColor: "white",
      borderBottomWidth: 1,
      borderBottomColor: "#F0F0F0",
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 0.2,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: "#DDD",
      borderRadius: 4,
      marginRight: 10,
    },
    avatar: {
      width: 35,
      height: 35,
      borderRadius: 17.5,
    },

    infoSection: {
      flex: 0.4,
      paddingHorizontal: 5,
    },
    nameText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#333",
    },
    eventText: {
      fontSize: 11,
      color: "#999",
    },

    rightSection: {
      flex: 0.4,
      alignItems: "flex-end",
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 4,
    },
    statusText: {
      fontSize: 10,
      fontWeight: "700",
      color: "white",
    },
    statusAttending: {
      backgroundColor: "#4CAF50",
    },
    statusCheckIn: {
      backgroundColor: "#1a2a44",
    },
    statusInvited: {
      backgroundColor: "#FFC107",
    },
    ticketText: {
      fontSize: 11,
      fontWeight: "600",
      color: "#666",
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
    },
    managementTitle: {
      fontSize: 14,
      fontWeight: "800",
      marginBottom: 10,
      color: "#333",
    },
    actionScroll: {
      flexDirection: "row",
    },
    actionBtn: {
      backgroundColor: "#1a2a44",
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 8,
      marginRight: 10,
    },
    btnOutline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "#1a2a44",
    },
    actionBtnText: {
      color: "white",
      fontSize: 12,
      fontWeight: "700",
    },
    actionBtnTextOutline: {
      color: "#1a2a44",
      fontSize: 12,
      fontWeight: "700",
    },
  });
}
