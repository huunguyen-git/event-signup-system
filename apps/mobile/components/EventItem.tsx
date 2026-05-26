import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Colors } from "../constants/theme";
import { useRouter } from "expo-router";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { ApplicationService } from "@/axios/applicationService";

interface EventItemProps {
  event: ICreateEvent;
}
const EventItem = ({ event }: EventItemProps) => {
  const router = useRouter();
  const [registeredCount, setRegisteredCount] = useState(0);

  useEffect(() => {
    const fetchRegisteredCount = async () => {
      try {
        const apps = await ApplicationService.getEventApplications(event.id);
        if (apps && Array.isArray(apps)) {
          const approvedOrPending = apps.filter(
            (app: any) => app.status === "APPROVED" || app.status === "PENDING"
          );
          setRegisteredCount(approvedOrPending.length);
        }
      } catch (error) {
        console.log("Error fetching event applications:", error);
      }
    };
    fetchRegisteredCount();
  }, [event.id]);

  const handleEventDetails = () => {
    router.push({
      pathname: "/EventDetailsScreen",
      params: { id: event.id },
    });
  };
  const eventdate = new Date(event.event_date);

  const datePart = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(eventdate);

  const timePart = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(eventdate);

  return (
    <View style={styles.container}>
      <Image
        source={
          event.banner_url
            ? { uri: event.banner_url }
            : require("../assets/images/icon.png")
        }
        style={styles.eventImage}
      />
      <View style={styles.event}>
        <CustomText variant="bold" style={styles.eventName}>
          {event.title}
        </CustomText>
        <CustomText style={styles.eventDate}>
          {datePart} - {timePart}
        </CustomText>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={handleEventDetails}
        >
          <CustomText variant="bold" style={styles.detailButtonText}>
            View Details
          </CustomText>
        </TouchableOpacity>
      </View>
      <View style={styles.registeredCountBadge}>
        <Ionicons name="people" size={14} color="#0B2D4F" style={{ marginRight: 4 }} />
        <CustomText variant="bold" style={styles.registeredCountText}>
          {registeredCount}/{event.max_attendees || 0}
        </CustomText>
      </View>
    </View>
  );
};
export default EventItem;
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
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
    position: "relative",
  },
  eventImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  event: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  eventName: {
    fontSize: 18,
    marginBottom: 6,
    color: "#1B2B52",
  },
  eventDate: {
    fontSize: 14,
    color: Colors.color.placeholder,
    marginBottom: 8,
  },
  detailButton: {
    backgroundColor: Colors.color.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 6,
    width: 130,
    shadowColor: Colors.color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  detailButtonText: {
    color: Colors.color.white,
    textAlign: "center",
    fontSize: 14,
  },
  registeredCountBadge: {
    position: "absolute",
    top: 10,
    right: 15,
    backgroundColor: "#E6F0FA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  registeredCountText: {
    fontSize: 12,
    color: "#0B2D4F",
  },
});
