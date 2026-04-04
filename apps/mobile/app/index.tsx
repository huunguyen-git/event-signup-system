import React,{ useState } from "react";
import {View,StyleSheet,TextInput,Text,Image,TouchableOpacity} from "react-native"
import {MaterialCommunityIcons} from "@expo/vector-icons"
import {Colors} from "../constants/theme"
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderText from "@/components/HeaderText";


const LoginScreen = () =>{

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    return <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <MaterialCommunityIcons name="domain" size={70} color={Colors.color.placeholder}/>
            <HeaderText/>
        </View>
        <View style={styles.body}>
            <Text style ={styles.welcomeText}>Welcome Back</Text>
            <Text style = {styles.eventText}>Please log in to manage or attend events.</Text>
            <View style={styles.input}>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="account-outline" size={40} color={Colors.color.placeholder}/>
                    <TextInput 
                        placeholder="UserName / Email"
                        placeholderTextColor={Colors.color.placeholder}
                        value={username}
                        onChangeText={(value) => setUsername(value)}
                        style={styles.textInput}/>
                </View>
            </View>
            <View style={styles.input}>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock-outline" size={40} color={Colors.color.placeholder}/>
                    <TextInput 
                        placeholder="Password"
                        placeholderTextColor={Colors.color.placeholder}
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={(value) => setPassword(value)}
                        style={styles.textInput}/>
                    <TouchableOpacity 
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}> 
                        <MaterialCommunityIcons name={showPassword ? "eye" : "eye-off"} size={40} color={Colors.color.placeholder} />
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={styles.loginButton}>
                <Text style={styles.loginButtonText}>LOGIN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.forgotButton}>
                <Text style={styles.forgotButtonText}>Forget password?</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.footer}>
            <TouchableOpacity style={styles.registerButton}>
                <Text style={styles.registerButtonText}>Register for an account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.recoverButton}>
                <Text style={styles.recoverButtonText}>Recover Password</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
}
export default LoginScreen;
const styles=StyleSheet.create({
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
    logo:{
        height: 70,
        width: 70,
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
    },
    eventText:{
        fontSize: 16,
        color: Colors.color.text,
        marginBottom: 40,
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
    eyeIcon:{
        marginLeft: 'auto',
    },
    loginButton:{
        width: "90%",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.color.primary,
        borderRadius: 30,
        marginBottom: 10,
    },
    loginButtonText:{
        color: Colors.color.white,
        fontSize: 16,
    },
    forgotButton:{
        width: "90%",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    forgotButtonText:{
        color: Colors.color.primary,
        fontSize: 16,
    },
    footer:{
        width: "91%",
        height: 100,
        flexDirection: "row",
        justifyContent: "space-between",
        alignSelf: "center",
    },
    registerButton:{
        width:"55%",
        alignItems: "center",
        padding: 10,
    },
    recoverButton:{
        width:"45%",
        alignItems: "center",
        padding: 10,
    },
    registerButtonText:{
        color: Colors.color.primary,
        fontSize: 16,
    },
    recoverButtonText:{
        color: Colors.color.primary,
        fontSize: 16,
    }
})
