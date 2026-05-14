import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../constants/theme";
import { Users, MessageSquare, TrendingUp } from "lucide-react-native";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { useRouter } from "expo-router";

interface HostItem {
  event: ICreateEvent;
}
const HostEventItem = (event: HostItem) => {
  const statusColors = {
    LIVE: "#28a745",
    DRAFT: "#ffc107",
    COMPLETED: "#6c757d",
  };
  const router = useRouter();

  return (
    <View style={styles.card}>
      {/* Top Row: Title and Status */}
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {event.event.title}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                statusColors[event.event.status as keyof typeof statusColors],
            },
          ]}
        >
          <Text style={styles.statusText}>{event.event.status}</Text>
        </View>
      </View>

      {/* Details Row: Icons and Stats */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailsLabel}>Details</Text>

        {event.event.status && (
          <View style={styles.stat}>
            <TrendingUp size={14} color="#666" />
            <Text style={styles.statValue}>{event.event.status}</Text>
          </View>
        )}

        {event.event.max_attendees && (
          <View style={styles.stat}>
            <MessageSquare size={14} color="#666" />
            <Text style={styles.statValue}>{event.event.max_attendees}</Text>
          </View>
        )}

        <View style={styles.stat}>
          <Users size={14} color="#666" />
          <Text style={styles.statValue}>{event.event.max_attendees}</Text>
        </View>
      </View>

      {/* Actions Row: Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            router.push({
              pathname: "/EditEventScreen",
              params: { id: event.event.id },
            })
          }
        >
          <Text style={styles.secondaryButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            {event.event.status === "Draft" ? "View Vendors" : "View Attendees"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.color.white,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E1E9F4",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B2B52",
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  detailsLabel: {
    fontSize: 13,
    color: "#1B2B52",
    fontWeight: "600",
    marginRight: 12,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statValue: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#EBF2FF",
    borderWidth: 1,
    borderColor: "#ADC8FF",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#1B2B52",
    fontWeight: "600",
  },
  primaryButton: {
    flex: 2,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E1E9F4",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#1B2B52",
    fontWeight: "600",
  },
});

export default HostEventItem;
