import React,{ useState } from "react";
import {View,StyleSheet,TextInput,Text,TouchableOpacity} from "react-native"
import {MaterialCommunityIcons} from "@expo/vector-icons"
import {Colors} from "../constants/theme"
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, ScrollView } from "react-native-gesture-handler";
import EventItem from "@/components/EventItem";
const HomeScreen = () =>{
    const DATA = [
  {
    id: '1',
    eventName: 'International Tech Summit',
    eventDate: 'Jan 2023 - 7:30 pm',
  },
  {
    id: '2',
    eventName: 'City Food Festival',
    eventDate: 'Jan 2023 - 7:30 pm',
  },
  {
    id: '3',
    eventName: 'International Art Festival',
    eventDate: 'Jan 2023 - 7:30 pm',
  },
];
    return <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <MaterialCommunityIcons name="domain" size={40} color={Colors.color.white}/>
            <Text style={styles.connect}> <Text style={styles.event}>EVENT </Text>CONNECT</Text>
            <View style={styles.Icon}>
            <MaterialCommunityIcons name="bell-outline" size={40} color={Colors.color.white}/>
            <MaterialCommunityIcons name="account" size={40} color={Colors.color.primary} style={styles.accountIcon}/>
            </View>
        </View>
        <View style={styles.body}>
            <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={30} color={Colors.color.placeholder}/>
                <Text style={styles.searchText}>Search by event name, date or location...</Text>
            </View>
            <Text style={styles.upcomingEvent}>Upcoming Event</Text>
            <FlatList          
                data={DATA}
                renderItem={({ item }) => (
              <EventItem 
                eventName={item.eventName}
                eventDate={item.eventDate}
              />
            )}
            keyExtractor={(item) => item.id}/>
        </View>
        <View style={styles.footer}>
            <TouchableOpacity style={styles.footerItem}>
                <MaterialCommunityIcons name="home" size={30} color={Colors.color.placeholder}/>
                <Text style={styles.footerText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem}>
                <MaterialCommunityIcons name="view-dashboard" size={30} color={Colors.color.placeholder}/>
                <Text style={styles.footerText}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem}>
                <MaterialCommunityIcons name="qrcode-scan" size={30} color={Colors.color.placeholder}/>
                <Text style={styles.footerText}>Scan QR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem}>
                <MaterialCommunityIcons name="heart-outline" size={30} color={Colors.color.placeholder}/>
                <Text style={styles.footerText}>Saved</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem}>
                <MaterialCommunityIcons name="account-outline" size={30} color={Colors.color.placeholder}/>
                <Text style={styles.footerText}>Account</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
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
        backgroundColor: "#afc5e1",
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
    },
    searchText:{
        color: Colors.color.placeholder,
        fontSize: 16,
    },
    upcomingEvent:{
        fontSize: 20,
        fontWeight: "bold",
        marginRight: "auto",
    },
    footer:{
        height: 60,
        backgroundColor: Colors.color.white,
        flexDirection: "row",
        gap: 5,
        padding:5,
    },
    footerItem:{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    footerText:{
        color: Colors.color.placeholder,
        fontSize: 12,
    },
}); 