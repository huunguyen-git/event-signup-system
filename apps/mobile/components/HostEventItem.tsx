import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../constants/theme";
import { Users, MessageSquare, TrendingUp } from "lucide-react-native";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { useRouter } from "expo-router";
import { CustomText } from "@/components/CustomText";

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
        <CustomText variant="bold" style={styles.title} numberOfLines={1}>
          {event.event.title}
        </CustomText>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                statusColors[event.event.status as keyof typeof statusColors],
            },
          ]}
        >
          <CustomText variant="bold" style={styles.statusText}>{event.event.status}</CustomText>
        </View>
      </View>

      {/* Details Row: Icons and Stats */}
      <View style={styles.detailsRow}>
        <CustomText variant="medium" style={styles.detailsLabel}>Details</CustomText>

        {event.event.status && (
          <View style={styles.stat}>
            <TrendingUp size={14} color="#666" />
            <CustomText style={styles.statValue}>{event.event.status}</CustomText>
          </View>
        )}

        {event.event.max_attendees && (
          <View style={styles.stat}>
            <MessageSquare size={14} color="#666" />
            <CustomText style={styles.statValue}>{event.event.max_attendees}</CustomText>
          </View>
        )}

        <View style={styles.stat}>
          <Users size={14} color="#666" />
          <CustomText style={styles.statValue}>{event.event.max_attendees}</CustomText>
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
          <CustomText variant="medium" style={styles.secondaryButtonText}>Edit</CustomText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={()=>{router.push('/ViewAttendeesScreen')}}>
          <CustomText variant="medium" style={styles.primaryButtonText}>
            {event.event.status === "Draft" ? "View Vendors" : "View Attendees"}
          </CustomText>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.color.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
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
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  detailsLabel: {
    fontSize: 13,
    color: "#1B2B52",
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
  },
});

export default HostEventItem;
