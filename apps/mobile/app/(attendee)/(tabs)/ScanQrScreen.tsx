import React from "react";
import {View,StyleSheet,Text} from "react-native"
import {MaterialCommunityIcons} from "@expo/vector-icons"
import {Colors} from "../../../constants/theme"
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from "expo-router";
const HomeScreen = () =>{

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
            <Text style={styles.ScanQr}>Scan Qr</Text>
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
    ScanQr:{
        fontSize: 20,
        fontWeight: "bold",
        marginRight: "auto",
    },
}); 