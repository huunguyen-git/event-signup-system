import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Colors } from "../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CustomText } from "@/components/CustomText";

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
        <CustomText>
          <MaterialCommunityIcons
            name="star"
            size={20}
            color={Colors.color.primary}
          />
          {organizer}
        </CustomText>
        <CustomText variant="bold" style={styles.eventName}>{eventName}</CustomText>
        <View style={styles.button}>
          <MaterialCommunityIcons name="star" size={30} color={"yellow"} />
          <TouchableOpacity style={styles.detailButton}>
            <CustomText variant="bold" style={styles.detailButtonText}>View Details</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default SavedEventItem;
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
  },
  eventImage: {
    width: 100,
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
  detailButton: {
    backgroundColor: Colors.color.lightblue,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 6,
    width: 130,
    marginRight: "auto",
    shadowColor: Colors.color.lightblue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  detailButtonText: {
    color: Colors.color.text,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});
