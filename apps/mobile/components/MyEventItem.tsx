import React from "react";
import {View,StyleSheet,Image,Text,TouchableOpacity} from "react-native"
import {Colors} from "../constants/theme"
 
interface EventItemProps {
    eventCategory: string;
    eventName: string;
    eventDate: string;
    eventStatus?: string;
}
const MyEventItem = ({ eventCategory, eventName, eventDate, eventStatus }: EventItemProps) =>{
    return <TouchableOpacity style={styles.container}>
        <Image source={require('../assets/images/icon.png')} style={styles.eventImage}/>
        <View style={styles.event}>
            <Text style={styles.eventName}>{eventCategory}: {eventName}</Text>
            <Text style={styles.eventDate}>{eventDate}</Text>
            {eventStatus && <Text style={styles.eventStatus}>{eventStatus}</Text>}

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