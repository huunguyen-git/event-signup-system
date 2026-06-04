import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Colors } from "../constants/theme";
import { useRouter } from "expo-router";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { CustomText } from "@/components/CustomText";

interface EventItem {
  event: ICreateEvent;
  applicationStatus?: string;
  checkedIn?: boolean;
}

const MyEventItem = ({ event, applicationStatus, checkedIn }: EventItem) => {
  const router = useRouter();
  const handleEventDetails = () => {
    router.push({
      pathname: "/EventDetailsScreen",
      params: { id: event.id, isRegistered: "true" },
    });
  };
  const eventDate = new Date(event.event_date);

  const datePart = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(eventDate);

  const timePart = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(eventDate);

  let statusBg = "#F3F4F6";
  let statusTextColor = "#6B7280";
  let statusLabel = applicationStatus || "PENDING";

  if (applicationStatus === "APPROVED") {
    statusBg = "#E8F5E9";
    statusTextColor = "#2E7D32";
    statusLabel = "APPROVED";
  } else if (applicationStatus === "PENDING") {
    statusBg = "#E3F2FD";
    statusTextColor = "#1565C0";
    statusLabel = "PENDING";
  } else if (applicationStatus === "REJECTED") {
    statusBg = "#FFEBEE";
    statusTextColor = "#C62828";
    statusLabel = "REJECTED";
  } else if (applicationStatus === "WAITLISTED") {
    statusBg = "#FFF3E0";
    statusTextColor = "#EF6C00";
    statusLabel = "WAITLISTED";
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleEventDetails}>
      <Image
        source={{ uri: event.banner_url }}
        style={styles.eventImage}
      />
      <View style={styles.event}>
        <View style={styles.headerRow}>
          <CustomText variant="bold" style={styles.eventName} numberOfLines={1}>
            {event.title}
          </CustomText>
        </View>
        <CustomText style={styles.eventDate}>
          {datePart} - {timePart}
        </CustomText>
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <CustomText variant="bold" style={[styles.statusText, { color: statusTextColor }]}>
              {statusLabel}
            </CustomText>
          </View>
          {checkedIn && (
            <View style={styles.checkedInBadge}>
              <CustomText variant="bold" style={styles.checkedInText}>
                CHECKED-IN
              </CustomText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MyEventItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.color.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  event: {
    flex: 1,
    marginLeft: 15,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  eventName: {
    fontSize: 16,
    color: Colors.color.text,
    flex: 1,
  },
  eventDate: {
    fontSize: 13,
    color: Colors.color.placeholder,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
  },
  checkedInBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  checkedInText: {
    fontSize: 11,
    color: "#0369A1",
  },
});
