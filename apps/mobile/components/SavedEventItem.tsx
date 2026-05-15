import React from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import { Colors } from "../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface EventItemProps {
  organizer: string;
  eventName: string;
}
const SavedEventItem = ({ organizer, eventName }: EventItemProps) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/icon.png")}
        style={styles.eventImage}
      />
      <View style={styles.event}>
        <Text>
          <MaterialCommunityIcons
            name="star"
            size={20}
            color={Colors.color.primary}
          />
          {organizer}
        </Text>
        <Text style={styles.eventName}>{eventName}</Text>
        <View style={styles.button}>
          <MaterialCommunityIcons name="star" size={30} color={"yellow"} />
          <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.detailButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default SavedEventItem;
const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    flexDirection: "row",
    backgroundColor: Colors.color.white,
    borderRadius: 10,
    padding: 15,
    margin: 10,
  },
  eventImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  event: {
    flex: 1,
    marginLeft: 10,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 16,
    color: Colors.color.placeholder,
    marginBottom: 5,
  },
  detailButton: {
    backgroundColor: Colors.color.lightblue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    width: 130,
    marginRight: "auto",
  },
  detailButtonText: {
    color: Colors.color.text,
    fontWeight: "bold",
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});
