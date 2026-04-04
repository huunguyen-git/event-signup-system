import React,{ useState } from "react";
import {View,StyleSheet,TextInput,Text,Image,TouchableOpacity} from "react-native"
import {MaterialCommunityIcons} from "@expo/vector-icons"
import {Colors} from "../constants/theme"
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderText from "@/components/HeaderText";

const ForgotPasswordScreen = () =>{
    const [username, setUsername] = useState("");
    const [RegisterEmail, setRegisterEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    return <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="domain" size={70} color={Colors.color.placeholder}/>
                <HeaderText/>
            </View>
            <View style={styles.body}>
                <Text style ={styles.welcomeText}>Creat Your Account</Text>
                <Text style = {styles.eventText}>Please fill in the details below to register for the EVENT CONNECT platform. </Text>
                <View style={styles.input}>
                    <Text style={styles.labelText}>Full Name</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="account-outline" size={40} color={Colors.color.placeholder}/>
                        <TextInput 
                            placeholder="Enter your full name"
                            placeholderTextColor={Colors.color.placeholder}
                            value={username}
                            onChangeText={(value) => setUsername(value)}
                            style={styles.textInput}/>
                    </View>
                </View>
                <View style={styles.input}>
                    <Text style={styles.labelText}>Email</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="email-outline" size={40} color={Colors.color.placeholder}/>
                        <TextInput 
                            placeholder="user@gmail.com"
                            placeholderTextColor={Colors.color.placeholder}
                            value={RegisterEmail}
                            
                            onChangeText={(value) => setRegisterEmail(value)}
                            style={styles.textInput}/>
                    </View>
                </View>
                <View style={styles.input}>
                    <Text style={styles.labelText}>Password</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="lock-outline" size={40} color={Colors.color.placeholder}/>
                        <TextInput 
                            placeholder="Enter your password"
                            placeholderTextColor={Colors.color.placeholder}
                            value={password}
                            secureTextEntry={!showPassword}
                            onChangeText={(value) => setPassword(value)}
                            style={styles.textInput}/>
                            <TouchableOpacity 
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}> 
                                <MaterialCommunityIcons name={showPassword ? "eye" : "eye-off"} size={40} color={Colors.color.placeholder} />
                            </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.input}>
                    <Text style={styles.labelText}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="lock-outline" size={40} color={Colors.color.placeholder}/>
                        <TextInput 
                            placeholder="Confirm your password"
                            placeholderTextColor={Colors.color.placeholder}
                            value={confirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            onChangeText={(value) => setConfirmPassword(value)}
                            style={styles.textInput}/>
                            <TouchableOpacity 
                                style={styles.eyeIcon}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}> 
                                <MaterialCommunityIcons name={showConfirmPassword ? "eye" : "eye-off"} size={40} color={Colors.color.placeholder} />
                            </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={styles.registerButton}>
                    <Text style={styles.registerButtonText}>REGISTER</Text>
                </TouchableOpacity>
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity>
                            <Text style={styles.backButtonText}>Login</Text>
                        </TouchableOpacity>
                    
                </View>
                
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
        marginBottom: 10,
        textAlign: "center",
    },
    input:{
        width:"90%",
        marginBottom:10,
    },
    labelText:{
        fontWeight: "bold",
        marginStart: 53,
        fontSize: 16,
        color: Colors.color.text,
    },
    inputContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    textInput:{
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.color.placeholder,
    },
    registerButton:{
        width: "90%",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.color.primary,
        borderRadius: 30,
        marginBottom: 10,
        borderWidth: 1,
    },
    registerButtonText:{
        color: Colors.color.white,
        fontSize: 16,
    },
    backButtonText:{
        color: Colors.color.primary,
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    eyeIcon:{
        marginLeft: 'auto',
    },
    footer:{
        width: "91%",
        height: 100,
        flexDirection: "row",
        justifyContent: "center",
        gap: 5,
    },
    footerText:{
        fontSize: 16,
        color: Colors.color.text,
    },
})