import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderText from "@/components/HeaderText";
import { Stack, useRouter } from "expo-router";
import { AuthService } from "../../axios/authService";

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
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ các trường thông tin");
      return;
    }

  const uitEmailRegex = /^[a-zA-Z0-9._%+-]+@(gm\.uit\.edu\.vn|uit\.edu\.vn)$/;
      if (!uitEmailRegex.test(email)) {
        Alert.alert(
          "Lỗi định dạng Email",
          "Hệ thống chỉ chấp nhận email nội bộ trường (@gm.uit.edu.vn hoặc @uit.edu.vn). Vui lòng kiểm tra lại."
        );
        return;
      }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Lỗi", "Mật khẩu phải có tối thiểu 8 ký tự");
      return;
    }

    try {
      setLoading(true);
      await AuthService.register({
        email,
        password,
        full_name: fullName,
        birthdate: birthdate.toISOString().split("T")[0],
      });
      Alert.alert(
        "Đăng ký thành công",
        "Tài khoản đã được tạo thành công! Bạn bắt buộc phải kiểm tra hộp thư Gmail của bạn để kích hoạt tài khoản. Bạn phải xác nhận email này thì mới có thể đăng nhập được vào ứng dụng.",
        [{ text: "Đã hiểu", onPress: () => router.replace("/LoginScreen") }]
      );
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Đăng ký thất bại. Vui lòng thử lại.";
      Alert.alert(
        "Đăng ký thất bại",
        errMsg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
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
                    Create Your Account
                  </CustomText>
                  <CustomText style={styles.eventText}>
                    Please fill in the details below to register for the EVENT
                    CONNECT platform.{" "}
                  </CustomText>

                  <View style={styles.input}>
                    <CustomText variant="bold" style={styles.labelText}>
                      Full Name
                    </CustomText>
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
                    <CustomText variant="bold" style={styles.labelText}>
                      Email
                    </CustomText>
                    <View style={styles.inputContainer}>
                      <MaterialCommunityIcons
                        name="email-outline"
                        size={40}
                        color={Colors.color.placeholder}
                      />
                      <TextInput
                        placeholder="user@gm.uit.edu.vn"
                        placeholderTextColor={Colors.color.placeholder}
                        value={email}
                        onChangeText={(value) => setEmail(value)}
                        style={styles.textInput}
                      />
                    </View>
                  </View>

                  <View style={styles.input}>
                    <CustomText variant="bold" style={styles.labelText}>
                      Birthdate
                    </CustomText>
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
                            textAlignVertical: "center"
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
                    <CustomText variant="bold" style={styles.labelText}>
                      Password
                    </CustomText>
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
                    <CustomText variant="bold" style={styles.labelText}>
                      Confirm Password
                    </CustomText>
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
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
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
                      <CustomText style={styles.registerButtonText}>
                        REGISTER
                      </CustomText>
                    )}
                  </TouchableOpacity>
                  <View style={styles.footer}>
                    <CustomText style={styles.footerText}>
                      Already have an account?
                    </CustomText>
                    <TouchableOpacity
                      onPress={() => router.replace("/LoginScreen")}
                    >
                      <CustomText style={styles.backButtonText}>
                        Login
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
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
    marginBottom: 8,
  },
  labelText: {
    marginStart: 10,
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
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 5,
    marginBottom: 10,
  },
  roleButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f6f9",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  roleButtonActive: {
    backgroundColor: Colors.color.primary,
    borderColor: Colors.color.primary,
  },
  roleButtonText: {
    fontSize: 12,
    color: Colors.color.primary,
    marginTop: 4,
    textAlign: "center",
  },
  roleButtonTextActive: {
    color: Colors.color.white,
  },
});
