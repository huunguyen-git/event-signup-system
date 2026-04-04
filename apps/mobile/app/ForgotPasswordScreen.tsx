import React,{ useState } from "react";
import {View,StyleSheet,TextInput,Text,Image,TouchableOpacity} from "react-native"
import {MaterialCommunityIcons} from "@expo/vector-icons"
import {Colors} from "../constants/theme"
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderText from "@/components/HeaderText";

const ForgotPasswordScreen = () =>{
    const [RegisterEmail, setRegisterEmail] = useState("");
    return <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="domain" size={70} color={Colors.color.placeholder}/>
                <HeaderText/>
            </View>
            <View style={styles.body}>
                <Text style ={styles.welcomeText}>Forgot Password</Text>
                <Text style = {styles.eventText}>Enter your registered email address to receive a password reset instructions.  </Text>
                <View style={styles.input}>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="email-outline" size={40} color={Colors.color.placeholder}/>
                        <TextInput 
                            placeholder="Registered Email"
                            placeholderTextColor={Colors.color.placeholder}
                            value={RegisterEmail}
                            onChangeText={(value) => setRegisterEmail(value)}
                            style={styles.textInput}/>
                    </View>
                </View>
                <TouchableOpacity style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>SEND INSTRUCTIONS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back to Login</Text>
                </TouchableOpacity>
            </View>
            
        </SafeAreaView>
};
export default ForgotPasswordScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.color.white,
    },
    header:{
        height:170,
        justifyContent: "center",
        backgroundColor: Colors.color.primary,
        alignItems: "center",
        padding:10,
    },
    body:{
        flex: 1,
        padding:10,
        alignItems: "center",
        borderBottomColor: Colors.color.placeholder,
        borderBottomWidth: 1,
    },
    welcomeText:{
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 10,
    },
    eventText:{
        fontSize: 16,
        color: Colors.color.text,
        marginBottom: 40,
        textAlign: "center",
    },
    input:{
        width:"90%",
        marginBottom:10,
    },
    inputContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.color.placeholder,
        marginBottom: 10,
    },
    textInput:{
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
    },
    sendButton:{
        width: "90%",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.color.primary,
        borderRadius: 30,
        marginBottom: 10,
    },
    sendButtonText:{
        color: Colors.color.white,
        fontSize: 16,
    },
    backButton:{
        width: "90%",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    backButtonText:{
        color: Colors.color.primary,
        fontSize: 16,
    },
})