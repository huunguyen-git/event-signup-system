import React, { useState, useEffect } from "react";
import {View,StyleSheet,TextInput,Text, TouchableOpacity} from "react-native"
import {MaterialCommunityIcons} from "@expo/vector-icons"
import {Colors} from "../../../constants/theme"
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from "react-native-gesture-handler";
import EventItem from "@/components/EventItem";
import { Stack, useRouter } from "expo-router";
import { ICreateEvent } from "@/axios/dto/eventModel";
import { EventService } from "@/axios/eventService";
const HomeScreen = () =>{
    const router = useRouter();
    const [data, setData] = useState<ICreateEvent[]>([]);
        useEffect(() =>{
            const fetchData = async ()=>{
                try{
                    const data = await EventService.getEvents();
                    setData(data);
                }
                catch(error){
                    console.error("Error fetching data:", error);
                }
            }
            fetchData();
        }, [])
    return <>
    <Stack.Screen options={{ headerShown: false }} />
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <MaterialCommunityIcons name="domain" size={40} color={Colors.color.white}/>
            <Text style={styles.connect}> <Text style={styles.event}>EVENT </Text>CONNECT</Text>
            <View style={styles.Icon}>
            <MaterialCommunityIcons name="bell-outline" size={40} color={Colors.color.white}/>
            <TouchableOpacity onPress={() => router.push('/AccountScreen')}>
                <MaterialCommunityIcons name="account" size={40} color={Colors.color.primary} style={styles.accountIcon}/>
            </TouchableOpacity>
            </View>
        </View>
        <View style={styles.body}>
            <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={30} color={Colors.color.placeholder}/>
                <TextInput style={styles.searchText} 
                placeholder="Search by event name, date or location..." 
                placeholderTextColor={Colors.color.placeholder}
                scrollEnabled={false}/>
            </View>
            <Text style={styles.upcomingEvent}>Upcoming Event</Text>
            <FlatList          
                data={data}
                renderItem={({ item }) => (
              <EventItem 
                event={item}
              />
            )}
            keyExtractor={(item) => item.id}/>
        </View>
    </SafeAreaView>
    </>
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.color.white,
    },
    header:{
        height: 60,
        alignItems: "center",
        backgroundColor: Colors.color.primary,
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 10,
    },
    connect:{
        fontSize: 18,
        color: Colors.color.white,
    },
    event:{
        fontWeight: 700,
    },
    accountIcon:{
        height: 40,
        backgroundColor: Colors.color.lightblue,
        borderRadius: 20,
    },
    Icon:{
        flexDirection: "row",
        gap:10,
        alignItems: "center",
        marginLeft: "auto",
    },
    body:{
        backgroundColor: Colors.color.background,
        flex: 1,
        padding:10,
    },
    searchBar:{
        height: 40,
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.color.placeholder,
        borderRadius: 30,
        backgroundColor: Colors.color.white,
        gap: 5,
        marginTop: 10,
        marginBottom: 20,
        paddingStart: 15,
    },
    searchText:{
        flex: 1,
        color: Colors.color.placeholder,
        fontSize: 16,
    },
    upcomingEvent:{
        fontSize: 20,
        fontWeight: "bold",
        marginRight: "auto",
    },
}); 