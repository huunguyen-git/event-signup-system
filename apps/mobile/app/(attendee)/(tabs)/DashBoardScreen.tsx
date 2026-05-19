import { View, StyleSheet, TextInput } from "react-native";
import { CustomText } from "@/components/CustomText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";
import MyEventItem from "@/components/MyEventItem";
import { Stack } from "expo-router";
import React, { useState, useEffect } from "react";
import { EventService } from "../../../axios/eventService";
import { ICreateEvent } from "../../../axios/dto/eventModel";
import { getUserId } from "@/services/storage";
import Header from "@/components/Header";

const DashBoardScreen = () => {
  const [data, setData] = useState<ICreateEvent[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const UserId = await getUserId();
        const data = await EventService.getEventsByUser(UserId);
        setData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.body}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons
              name="magnify"
              size={30}
              color={Colors.color.placeholder}
            />
            <TextInput
              style={styles.searchText}
              placeholder="Search by event name, date or location..."
              placeholderTextColor={Colors.color.placeholder}
            />
          </View>
          <View style={styles.headerBody}>
            <CustomText variant="bold" style={styles.upcomingEvent}>My Event</CustomText>
            <CustomText variant="bold" style={styles.eventCount}>Total Event: {data?.length}</CustomText>
          </View>

          <FlatList
            data={data}
            renderItem={({ item }) => <MyEventItem event={item} />}
            keyExtractor={(item) => item.id}
          />
        </View>
      </SafeAreaView>
    </>
  );
};
export default DashBoardScreen;
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
  searchBar: {
    height: 45,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: Colors.color.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    gap: 5,
    marginTop: 10,
    marginBottom: 20,
    paddingStart: 15,
  },
  searchText: {
    flex: 1,
    color: Colors.color.placeholder,
    fontSize: 16,
  },
  upcomingEvent: {
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
