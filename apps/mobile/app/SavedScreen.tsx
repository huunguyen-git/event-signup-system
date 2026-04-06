import React,{ useState } from "react";
import {View,StyleSheet,TextInput,Text,TouchableOpacity} from "react-native"
import {MaterialCommunityIcons} from "@expo/vector-icons"
import {Colors} from "../constants/theme"
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, ScrollView } from "react-native-gesture-handler";
import SavedEventItem from "@/components/SavedEventItem";
import { Stack, useRouter } from "expo-router";
const SavedScreen = () =>{
    const router = useRouter();
    const DATA = [
  {
    id: '1',
    organizer: 'tim-ed',
    eventName: 'Global AI Tech Summit - Keynote'
  },
  {
    id: '2',
    organizer: 'tim-ed',
    eventName: 'Urban Planning Workshop'
  },
  {
    id: '3',
    organizer: 'tim-ed',
    eventName: 'Creative Arts Festival'
  }
];

    return <>
    <Stack.Screen options={{ headerShown: false }} />
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <MaterialCommunityIcons name="domain" size={40} color={Colors.color.white}/>
            <Text style={styles.connect}> <Text style={styles.event}>EVENT </Text>CONNECT</Text>
            <View style={styles.Icon}>
            <MaterialCommunityIcons name="bell-outline" size={40} color={Colors.color.white}/>
            <MaterialCommunityIcons name="account" size={40} color={Colors.color.primary} style={styles.accountIcon}/>
            </View>
        </View>
        <View style={styles.body}>
            <Text style={styles.saveEvent}>Saved Events</Text>
            <Text style={styles.eventCount}>Total Event: {DATA.length}</Text>
            <FlatList
                data={DATA}
                renderItem={({ item }) => (
              <SavedEventItem
                organizer={item.organizer}
                eventName={item.eventName}/>
            )}
            keyExtractor={(item) => item.eventName}/>

        </View>
        <View style={styles.footer}>
            <TouchableOpacity style={styles.footerItem}  onPress={()=> router.replace("/HomeScreen")}>
                <MaterialCommunityIcons name="home" size={30} color={Colors.color.placeholder}/>
                <Text style={[styles.footerText, { color: Colors.color.primary }]}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem} onPress={()=> router.replace("/DashBoardScreen")}>
                <MaterialCommunityIcons name="view-dashboard" size={30} color={Colors.color.placeholder}/>
                <Text style={styles.footerText}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem} onPress={()=> router.replace("/ScanQrScreen")}>
                <MaterialCommunityIcons name="qrcode-scan" size={30} color={Colors.color.placeholder}/>
                <Text style={styles.footerText}>Scan QR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerItem, { backgroundColor: Colors.color.lightblue }]} >
                <MaterialCommunityIcons name="heart-outline" size={30} color={Colors.color.primary}/>
                <Text style={[styles.footerText, { color: Colors.color.primary }]}>Saved</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerItem} onPress={()=> router.replace("/AccountScreen")}>
                <MaterialCommunityIcons name="account-outline" size={30} color={Colors.color.placeholder}/>
                <Text style={styles.footerText}>Account</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
    </>
};
export default SavedScreen;
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
    saveEvent:{
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
    headerBody:{
        flexDirection: "row",
    },
    eventCount:{
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: "auto",
    },
}); 