import React from "react";
import {View,StyleSheet,Image,Text,TouchableOpacity} from "react-native"
import {Colors} from "../constants/theme"
import { useRouter } from "expo-router";
 
interface EventItemProps {
  eventName: string;
  eventDate: string;
}
const EventItem = ({ eventName, eventDate }: EventItemProps) =>{
    const router = useRouter();
    return <TouchableOpacity onPress={()=> router.push("/EventDetailsScreen")}>
    <View style={styles.container}>
        <Image source={require('../assets/images/icon.png')} style={styles.eventImage}/>
        <View style={styles.event}>
            <Text style={styles.eventName}>{eventName}</Text>
            <Text style={styles.eventDate}>{eventDate}</Text>
            <TouchableOpacity style={styles.detailButton}>
                <Text style={styles.detailButtonText}>View Details</Text>
            </TouchableOpacity>
        </View>
    </View>
    </TouchableOpacity> 
};
export default EventItem;
const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        flexDirection: "row",
        backgroundColor: Colors.color.white,
        borderRadius: 10,
        padding: 15,
        margin: 10,
    },
    eventImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    event: {
        flex: 1,
        marginLeft: 10,
    },
    eventName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    eventDate: {
        fontSize: 16,
        color: Colors.color.placeholder,
        marginBottom: 5,
    },
    detailButton: {
        backgroundColor: Colors.color.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
        width: 130,
    },
    detailButtonText: {
        color: Colors.color.white,
        fontWeight: "bold",
        textAlign: "center",
    },

});