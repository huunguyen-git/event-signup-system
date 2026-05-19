import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderText from "@/components/HeaderText";
import { Stack, useRouter } from "expo-router";
import { AuthService } from "../../axios/authService";
// import { authApi } from "@/services/api";

const CreateAccountScreen = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword || !birthdate) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      const data = await AuthService.register({
        email,
        password,
        full_name: fullName,
        birthdate: birthdate.toISOString().split("T")[0],
      });
      Alert.alert("Success", "Account created! Please log in.");
      router.replace("/LoginScreen");
    } catch (err: any) {
      Alert.alert(
        "Registration failed",
        err?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="domain"
            size={70}
            color={Colors.color.placeholder}
          />
          <HeaderText />
        </View>
        <View style={styles.body}>
          <CustomText variant="bold" style={styles.welcomeText}>Create Your Account</CustomText>
          <CustomText style={styles.eventText}>
            Please fill in the details below to register for the EVENT CONNECT
            platform.{" "}
          </CustomText>

          <View style={styles.input}>
            <CustomText variant="bold" style={styles.labelText}>Full Name</CustomText>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="account-outline"
                size={40}
                color={Colors.color.placeholder}
              />
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor={Colors.color.placeholder}
                value={fullName}
                onChangeText={(value) => setFullName(value)}
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.input}>
            <CustomText variant="bold" style={styles.labelText}>Email</CustomText>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="email-outline"
                size={40}
                color={Colors.color.placeholder}
              />
              <TextInput
                placeholder="user@gmail.com"
                placeholderTextColor={Colors.color.placeholder}
                value={email}
                onChangeText={(value) => setEmail(value)}
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.input}>
            <CustomText variant="bold" style={styles.labelText}>Birthdate</CustomText>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons
                name="calendar-outline"
                size={40}
                color={Colors.color.placeholder}
              />
              <CustomText
                style={[
                  styles.textInput,
                  {
                    color: birthdate
                      ? Colors.color.text
                      : Colors.color.placeholder,
                  },
                ]}
              >
                {birthdate
                  ? birthdate.toLocaleDateString()
                  : "Select your birthdate"}
              </CustomText>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birthdate || new Date(2000, 0, 1)}
                mode="date"
                maximumDate={new Date()}
                onChange={(_, date) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (date) {
                    setBirthdate(date);
                  }
                }}
              />
            )}
          </View>

          <View style={styles.input}>
            <CustomText variant="bold" style={styles.labelText}>Password</CustomText>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={40}
                color={Colors.color.placeholder}
              />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={Colors.color.placeholder}
                value={password}
                secureTextEntry={!showPassword}
                onChangeText={(value) => setPassword(value)}
                style={styles.textInput}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye" : "eye-off"}
                  size={40}
                  color={Colors.color.placeholder}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.input}>
            <CustomText variant="bold" style={styles.labelText}>Confirm Password</CustomText>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={40}
                color={Colors.color.placeholder}
              />
              <TextInput
                placeholder="Confirm your password"
                placeholderTextColor={Colors.color.placeholder}
                value={confirmPassword}
                secureTextEntry={!showConfirmPassword}
                onChangeText={(value) => setConfirmPassword(value)}
                style={styles.textInput}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={40}
                  color={Colors.color.placeholder}
                />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.color.white} />
            ) : (
              <CustomText style={styles.registerButtonText}>REGISTER</CustomText>
            )}
          </TouchableOpacity>
          <View style={styles.footer}>
            <CustomText style={styles.footerText}>Already have an account?</CustomText>
            <TouchableOpacity onPress={() => router.replace("/LoginScreen")}>
              <CustomText style={styles.backButtonText}>Login</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default CreateAccountScreen;

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
  body: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderBottomColor: Colors.color.placeholder,
    borderBottomWidth: 1,
  },
  welcomeText: {
    fontSize: 32,
    marginBottom: 10,
  },
  eventText: {
    fontSize: 16,
    color: Colors.color.text,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    width: "90%",
    marginBottom: 10,
  },
  labelText: {
    marginStart: 53,
    fontSize: 16,
    color: Colors.color.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 10,
    marginTop: 5,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    height: 45,
  },
  registerButton: {
    width: "90%",
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.color.primary,
    borderRadius: 27,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: Colors.color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  registerButtonText: {
    color: Colors.color.white,
    fontSize: 16,
  },
  backButtonText: {
    color: Colors.color.primary,
    fontSize: 16,
    textDecorationLine: "underline",
  },
  eyeIcon: {
    marginLeft: "auto",
  },
  footer: {
    width: "91%",
    height: 100,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  footerText: {
    fontSize: 16,
    color: Colors.color.text,
  },
});
