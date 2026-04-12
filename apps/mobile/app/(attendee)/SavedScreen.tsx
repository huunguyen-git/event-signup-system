import React from "react";
import {View,StyleSheet,Text} from "react-native"
import {MaterialCommunityIcons} from "@expo/vector-icons"
import {Colors} from "../../constants/theme"
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from "react-native-gesture-handler";
import SavedEventItem from "@/components/SavedEventItem";
import { Stack } from "expo-router";
import { SavedData } from "@/scripts/data";

const SavedScreen = () =>{
    

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
            <Text style={styles.eventCount}>Total Event: {SavedData.length}</Text>
            <FlatList
                data={SavedData}
                renderItem={({ item }) => (
              <SavedEventItem
                organizer={item.organizer}
                eventName={item.eventName}/>
            )}
            keyExtractor={(item) => item.eventName}/>

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
    headerBody:{
        flexDirection: "row",
    },
    eventCount:{
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: "auto",
    },
}); 