import React from "react";
import {View,StyleSheet,Image,Text,TouchableOpacity} from "react-native"
import {MaterialCommunityIcons} from "@expo/vector-icons"
import {Colors} from "../../constants/theme"
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
            <Text style={styles.profileOverview}>Profile Overview</Text>
            <View style={styles.profileInfo}>
                <Image source={require('../../assets/images/favicon.png')} style={styles.profileImage}/>
                <View>
                    <Text style={styles.profileName}>John Doe</Text>
                    <Text style={styles.profileJob}>Event Organizer</Text>
                    <View style={styles.profileButton}>
                        <TouchableOpacity style={styles.editButton}>
                            <Text style={styles.editButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editButton}>
                            <Text style={styles.editButtonText}>View Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <Text style={styles.profileOverview}>My Activity</Text>
            <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                    <MaterialCommunityIcons name="ticket" size={30} color={Colors.color.primary} style={{backgroundColor: Colors.color.lightblue, borderRadius: 20}}/>
                </View>
                <View>
                    <Text style={styles.activityTitle}>My Registrations</Text>
                    <Text style={styles.activityText}>3 Upcoming, 1 Past</Text>
                </View>
            </View>
            <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                    <MaterialCommunityIcons name="ticket-percent" size={30} color={Colors.color.primary} style={{backgroundColor: Colors.color.lightblue, borderRadius: 20}}/>
                </View>
                <View>
                    <Text style={styles.activityTitle}>Purchased Tickets</Text>
                    <Text style={styles.activityText}>Transaction History</Text>
                </View>
            </View>
            <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                    <MaterialCommunityIcons name="handshake" size={30} color={Colors.color.primary} style={{backgroundColor: Colors.color.lightblue, borderRadius: 20}}/>
                </View>
                <View>
                    <Text style={styles.activityTitle}>My Connections</Text>
                    <Text style={styles.activityText}>32 Contacts Made</Text>
                </View>
            </View>
            <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                    <MaterialCommunityIcons name="flag" size={30} color={Colors.color.primary} style={{backgroundColor: Colors.color.lightblue, borderRadius: 20}}/>
                </View>
                <View>
                    <Text style={styles.activityTitle}>Saved Speaker</Text>
                    <Text style={styles.activityText}>4 Total</Text>
                </View>
            </View>
            <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                    <MaterialCommunityIcons name="cog" size={30} color={Colors.color.primary} style={{backgroundColor: Colors.color.lightblue, borderRadius: 20}}/>
                </View>
                <View>
                    <Text style={styles.activityTitle}>Account Settings</Text>
                </View>
            </View>
            <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                    <MaterialCommunityIcons name="key" size={30} color={Colors.color.primary} style={{backgroundColor: Colors.color.lightblue, borderRadius: 20}}/>
                </View>
                <View>
                    <Text style={styles.activityTitle}>Change Password</Text>
                </View>
            </View>
            <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                    <MaterialCommunityIcons name="logout" size={30} color={Colors.color.primary} style={{backgroundColor: Colors.color.lightblue, borderRadius: 20}}/>
                </View>
                <View>
                    <Text style={styles.activityTitle}>Log out</Text>
                </View>
            </View>
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
    profileOverview:{
        fontSize: 20,
        fontWeight: "bold",
        marginRight: "auto",
        marginVertical: 10,
    },
    profileInfo:{
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    profileImage:{
        height: 100,
        width: 100,
        borderRadius: 50,
        marginRight:15,
    },
    profileName:{
        fontSize: 24,
        fontWeight: "bold",
    },
    profileJob:{
        fontSize: 16,
        color: Colors.color.text,
    },
    activityIcon:{
        width: 40,
        height: 40,
        backgroundColor: Colors.color.lightblue,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    activityItem:{
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        marginBottom: 10,
    },
    activityTitle:{
        fontSize: 18,
        fontWeight: "bold",
    },
    activityText:{
        fontSize: 14,
        color: Colors.color.text,
    },
    editButton:{
        backgroundColor: Colors.color.lightblue,
        margin:5,
        borderRadius:10,
        padding:5,
    },
    editButtonText:{
        color: Colors.color.text,
        textAlign: "center",
    },
    profileButton:{
        flexDirection: "row",
    },
}); 