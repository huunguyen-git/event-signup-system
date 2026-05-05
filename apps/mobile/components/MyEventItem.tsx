import React from "react";
import {View,StyleSheet,Image,Text,TouchableOpacity} from "react-native"
import {Colors} from "../constants/theme"
import { useRouter } from "expo-router"
import { ICreateEvent } from "@/axios/dto/eventModel";

interface EventItem{
    event: ICreateEvent;
}
const MyEventItem = (event: EventItem) =>{
    const router = useRouter();
    const handleEventDetails = () => {
        console.log(event.event.id);
        router.push({
            pathname: "/EventDetailsScreen",
            params: {id: event.event.id},
        })
    };
    console.log(event.event.banner_url);
    return <TouchableOpacity style={styles.container}
                            onPress={handleEventDetails}>
        <Image source={{ uri: event.event.banner_url }} style={styles.eventImage}/>
        <View style={styles.event}>
            <Text style={styles.eventName}>{event.event.title}</Text>
            <Text style={styles.eventDate}>{event.event.event_date}</Text>
            {event.event.status && <Text style={styles.eventStatus}>{event.event.status}</Text>}

        </View>
    </TouchableOpacity>
};
export default MyEventItem;
const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        backgroundColor: Colors.color.white,
        borderRadius: 10,
        padding: 15,
        margin: 10,
    },
    eventImage: {
        width: "100%",
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
    eventStatus: {
        fontSize: 16,
        color: Colors.color.primary,
        marginBottom: 5,
    },

});