import React, { useState, useMemo, useCallback, useEffect } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { CustomText } from "@/components/CustomText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";
import EventItem from "@/components/EventItem";
import { Stack, useFocusEffect } from "expo-router";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { EventService } from "@/axios/eventService";
import Header from "@/components/Header";
import { getSocket } from "@/services/socket";

const HomeScreen = () => {
  const [data, setData] = useState<ICreateEvent[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  
  const fetchData = useCallback(async () => {
    try {
      const events = await EventService.getEvents();
      setData(
        events
          .filter((item: ICreateEvent) => item.status?.toUpperCase() === "PUBLISHED")
          .sort(
            (a: ICreateEvent, b: ICreateEvent) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),
      );
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    const socket = getSocket();
    
    socket.on("events_changed", fetchData);
    socket.on("applications_changed", fetchData);
    
    return () => {
      socket.off("events_changed", fetchData);
      socket.off("applications_changed", fetchData);
    };
  }, [fetchData]);
  const filterData = useMemo(() => {
    if (!searchText) return data;
    const formatQuery = searchText.toLowerCase();

    return data.filter((item) =>
      item.title.toLowerCase().includes(formatQuery),
    );
  }, [searchText, data]);

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
              placeholder="Search by event name..."
              placeholderTextColor={Colors.color.placeholder}
              scrollEnabled={false}
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
              }}
              clearButtonMode="while-editing"
            />
          </View>
          <CustomText variant="bold" style={styles.upcomingEvent}>
            Upcoming Events
          </CustomText>
          <FlatList
            data={filterData}
            renderItem={({ item }) => <EventItem event={item} />}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <CustomText style={styles.emptyText}>
                Không có sự kiện nào
              </CustomText>
            }
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color.white,
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
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
    fontSize: 16,
  },
});
