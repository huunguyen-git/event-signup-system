import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Colors } from "../constants/theme";
import { useRouter } from "expo-router";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { CustomText } from "@/components/CustomText";

interface EventItem {
  event: ICreateEvent;
}
const MyEventItem = (event: EventItem) => {
  const router = useRouter();
  const handleEventDetails = () => {
    router.push({
      pathname: "/EventDetailsScreen",
      params: { id: event.event.id, isRegistered: "true" },
    });
  };
  const eventDate = new Date(event.event.event_date);

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
  return (
    <TouchableOpacity style={styles.container} onPress={handleEventDetails}>
      <Image
        source={{ uri: event.event.banner_url }}
        style={styles.eventImage}
      />
      <View style={styles.event}>
        <CustomText variant="bold" style={styles.eventName}>
          {event.event.title}
        </CustomText>
        <CustomText style={styles.eventDate}>
          {datePart} - {timePart}
        </CustomText>
        {event.event.status && (
          <CustomText style={styles.eventStatus}>
            {event.event.status}
          </CustomText>
        )}
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
  },
  eventImage: {
    width: "100%",
    height: 100,
    borderRadius: 12,
  },
  event: {
    flex: 1,
    marginLeft: 10,
  },
  eventName: {
    fontSize: 18,
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 16,
    color: Colors.color.placeholder,
    marginBottom: 5,
  },
  eventStatus: {
    fontSize: 16,
    color: Colors.color.primary,
    marginBottom: 5,
  },
});
