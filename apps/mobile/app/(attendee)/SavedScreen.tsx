import React from "react";
import { View, StyleSheet } from "react-native";
import { CustomText } from "@/components/CustomText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";
import SavedEventItem from "@/components/SavedEventItem";
import { Stack } from "expo-router";
import { SavedData } from "@/scripts/data";

const SavedScreen = () => {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="domain"
            size={40}
            color={Colors.color.white}
          />
          <CustomText style={styles.connect}>
            {" "}
            <CustomText variant="bold" style={styles.event}>
              EVENT{" "}
            </CustomText>
            CONNECT
          </CustomText>
          <View style={styles.Icon}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={40}
              color={Colors.color.white}
            />
            <MaterialCommunityIcons
              name="account"
              size={40}
              color={Colors.color.primary}
              style={styles.accountIcon}
            />
          </View>
        </View>
        <View style={styles.body}>
          <CustomText variant="bold" style={styles.saveEvent}>
            Saved Events
          </CustomText>
          <CustomText variant="bold" style={styles.eventCount}>
            Total Event: {SavedData.length}
          </CustomText>
          <FlatList
            data={SavedData}
            renderItem={({ item }) => (
              <SavedEventItem
                organizer={item.organizer}
                eventName={item.eventName}
              />
            )}
            keyExtractor={(item) => item.eventName}
          />
        </View>
      </SafeAreaView>
    </>
  );
};
export default SavedScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color.white,
  },
  header: {
    height: 60,
    alignItems: "center",
    backgroundColor: Colors.color.primary,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
  },
  connect: {
    fontSize: 18,
    color: Colors.color.white,
  },
  event: {},
  accountIcon: {
    height: 40,
    backgroundColor: "#afc5e1",
    borderRadius: 20,
  },
  Icon: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginLeft: "auto",
  },
  body: {
    backgroundColor: Colors.color.background,
    flex: 1,
    padding: 10,
  },
  saveEvent: {
    fontSize: 20,
    marginRight: "auto",
  },
  headerBody: {
    flexDirection: "row",
  },
  eventCount: {
    fontSize: 20,
    marginLeft: "auto",
  },
});
