import React from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Colors } from "../constants/theme";
import { Users, MessageSquare, TrendingUp, Trash2 } from "lucide-react-native";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { useRouter } from "expo-router";
import { CustomText } from "@/components/CustomText";
import { EventService } from "@/axios/eventService";

interface HostItem {
  event: ICreateEvent;
}
const HostEventItem = ({ event }: HostItem) => {
  const statusColors = {
    PUBLISHED: "#28a745",
    DRAFT: "#ffc107",
    COMPLETED: "#6c757d",
  };
  const router = useRouter();

  const handleDelete = async () => {
    Alert.alert(
      "Xác nhận xoá",
      `Bạn có chắc chắn muốn xoá sự kiện "${event.title}" không? Hành động này không thể hoàn tác.`,
      [
        {
          text: "Huỷ",
          style: "cancel",
        },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            await EventService.deleteEvent(event.id);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Top Row: Title and Status */}
      <View style={styles.headerRow}>
        <CustomText variant="bold" style={styles.title} numberOfLines={1}>
          {event.title}
        </CustomText>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                statusColors[event.status as keyof typeof statusColors],
            },
          ]}
        >
          <CustomText variant="bold" style={styles.statusText}>
            {event.status}
          </CustomText>
        </View>
      </View>

      {/* Details Row: Icons and Stats */}
      <View style={styles.detailsRow}>
        <CustomText variant="medium" style={styles.detailsLabel}>
          Details
        </CustomText>

        {event.status && (
          <View style={styles.stat}>
            <TrendingUp size={14} color="#666" />
            <CustomText style={styles.statValue}>{event.status}</CustomText>
          </View>
        )}

        {event.max_attendees && (
          <View style={styles.stat}>
            <MessageSquare size={14} color="#666" />
            <CustomText style={styles.statValue}>
              {event.max_attendees}
            </CustomText>
          </View>
        )}

        <View style={styles.stat}>
          <Users size={14} color="#666" />
          <CustomText style={styles.statValue}>
            {event.max_attendees}
          </CustomText>
        </View>
      </View>

      {/* Actions Row: Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          disabled={event.status === "COMPLETED"}
          onPress={() =>
            router.push({
              pathname: "/EditEventScreen",
              params: { id: event.id },
            })
          }
        >
          <CustomText variant="medium" style={styles.secondaryButtonText}>
            Edit
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            router.push({
              pathname: "/ViewAttendeesScreen",
              params: { id: event.id },
            });
          }}
        >
          <CustomText variant="medium" style={styles.primaryButtonText}>
            {event.status === "Draft" ? "View Vendors" : "View Attendees"}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Trash2 size={18} color="#dc3545" />
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
    borderRadius: 20,
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
    alignItems: "center",
  },
  secondaryButton: {
    flex: 1.5,
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
    backgroundColor: "#EBF2FF",
    borderWidth: 1,
    borderColor: "#ADC8FF",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#1B2B52",
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f8d7da",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f5c6cb",
  },
});

export default HostEventItem;