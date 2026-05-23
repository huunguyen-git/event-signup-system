import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderText from "@/components/HeaderText";
import { useRouter } from "expo-router";
import { AuthService } from "../../axios/authService";
import { saveToken, saveUserId, getToken } from "@/services/storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { NotificationService } from "@/axios/notificationService";
import Constants from "expo-constants";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password");
      return;
    }

    try {
      setLoading(true);
      const data = await AuthService.login({ email, password });
      await saveToken(data.access_token);
      await saveUserId(data.user.id);
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus === "granted") {
          Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: false,
              shouldShowBanner: true,
              shouldShowList: true,
            }),
          });
          const token = await getToken();
          const tok = { token: token };
          await NotificationService.SaveToken(data.user.id, tok);
        }
      }
      router.replace("/HomeScreen");
    } catch (error: any) {
      Alert.alert("Login Failed", "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <View style={styles.header}>
                <MaterialCommunityIcons
                  name="domain"
                  size={70}
                  color={Colors.color.placeholder}
                />
                <HeaderText />
              </View>
              <View style={styles.body}>
                <CustomText variant="bold" style={styles.welcomeText}>
                  Welcome Back
                </CustomText>
                <CustomText style={styles.eventText}>
                  Please log in to manage or attend events.
                </CustomText>
                <View style={styles.input}>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={40}
                      color={Colors.color.placeholder}
                    />
                    <TextInput
                      placeholder="Email"
                      placeholderTextColor={Colors.color.placeholder}
                      value={email}
                      onChangeText={(value) => setEmail(value)}
                      style={styles.textInput}
                    />
                  </View>
                </View>
                <View style={styles.input}>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="lock-outline"
                      size={40}
                      color={Colors.color.placeholder}
                    />
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor={Colors.color.placeholder}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={(value) => setPassword(value)}
                      style={styles.textInput}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? "eye" : "eye-off"}
                        size={30}
                        color={Colors.color.placeholder}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.color.white} />
                  ) : (
                    <CustomText variant="bold" style={styles.loginButtonText}>
                      LOGIN
                    </CustomText>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.forgotButton}
                  onPress={() => router.push("/ForgotPasswordScreen")}
                >
                  <CustomText style={styles.forgotButtonText}>
                    Forget password?
                  </CustomText>
                </TouchableOpacity>
              </View>
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => router.push("/CreateAccount")}
                >
                  <CustomText style={styles.registerButtonText}>
                    Register for an account
                  </CustomText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.recoverButton}>
                  <CustomText style={styles.recoverButtonText}>
                    Recover Password
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color.white,
  },
  header: {
    height: 170,
    justifyContent: "center",
    backgroundColor: Colors.color.primary,
    alignItems: "center",
    padding: 10,
  },
  logo: {
    height: 70,
    width: 70,
  },
  body: {
    flexGrow: 1,
    padding: 10,
    alignItems: "center",
    borderBottomColor: Colors.color.placeholder,
    borderBottomWidth: 1,
  },
  welcomeText: {
    fontSize: 32,
  },
  eventText: {
    fontSize: 16,
    color: Colors.color.text,
    marginBottom: 40,
  },
  input: {
    width: "90%",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    height: 45,
  },
  eyeIcon: {
    marginLeft: "auto",
  },
  loginButton: {
    width: "90%",
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.color.primary,
    borderRadius: 27,
    marginBottom: 10,
    marginTop: 10,
    shadowColor: Colors.color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  loginButtonText: {
    color: Colors.color.white,
    fontSize: 16,
  },
  forgotButton: {
    width: "90%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  forgotButtonText: {
    color: Colors.color.primary,
    fontSize: 16,
  },
  footer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  registerButton: {
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  recoverButton: {
    alignItems: "flex-end",
    paddingVertical: 10,
  },
  registerButtonText: {
    color: Colors.color.primary,
    fontSize: 16,
  },
  recoverButtonText: {
    color: Colors.color.primary,
    fontSize: 16,
  },
});
