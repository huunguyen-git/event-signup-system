import React from "react";
import {View,StyleSheet,Image,Text,TouchableOpacity} from "react-native"
import {Colors} from "../constants/theme"
import { useRouter } from "expo-router";
import { ICreateEvent } from "@/axios/dto/eventModel";
 
interface EventItemProps {
  event: ICreateEvent;
}
const EventItem = ({ event }: EventItemProps) =>{
    const router = useRouter();

    const handleEventDetails = () => {
        console.log(event.id);
        router.push({
            pathname: "/EventDetailsScreen",
            params: {id: event.id},
        })
    };
    const eventdate = new Date(event.event_date);

    const datePart = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    }).format(eventdate);

    const timePart = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
    }).format(eventdate);

    return <View>
        <View style={styles.container}>
            <Image source={event.banner_url ? { uri: event.banner_url } : require('../assets/images/icon.png')} style={styles.eventImage}/>
            <View style={styles.event}>
                <Text style={styles.eventName}>{event.title}</Text>
                <Text style={styles.eventDate}>{datePart} - {timePart}</Text>
                <TouchableOpacity style={styles.detailButton} onPress={handleEventDetails}>
                    <Text style={styles.detailButtonText}>View Details</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View> 
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