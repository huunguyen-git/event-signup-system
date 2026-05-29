import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderText from "@/components/HeaderText";
import { Stack, useRouter } from "expo-router";
import { AuthService } from "../../axios/authService";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email đăng ký");
      return;
    }

    try {
      setLoading(true);
      await AuthService.forgotPassword(email);
      Alert.alert(
        "Thành công",
        "Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn. (Nếu chạy local, vui lòng xem mã OTP trong Terminal của Server)"
      );
      setStep(2);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể gửi OTP khôi phục. Vui lòng kiểm tra lại email."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP gồm 6 chữ số");
      return;
    }
    if (otp.length !== 6) {
      Alert.alert("Lỗi", "Mã OTP phải có độ dài 6 ký tự");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có tối thiểu 8 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      await AuthService.resetPassword(email, otp, newPassword);
      Alert.alert("Thành công", "Mật khẩu của bạn đã được đặt lại thành công!", [
        { text: "Đăng nhập", onPress: () => router.replace("/LoginScreen") },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại."
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
                    {step === 1 ? "Forgot Password" : "Reset Password"}
                  </CustomText>
                  <CustomText style={styles.eventText}>
                    {step === 1
                      ? "Enter your registered email address to receive password reset instructions."
                      : `Enter the 6-digit OTP sent to ${email} along with your new password.`}
                  </CustomText>

                  {step === 1 ? (
                    /* Step 1: Email Input */
                    <View style={styles.inputForm}>
                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons
                          name="email-outline"
                          size={28}
                          color={Colors.color.placeholder}
                        />
                        <TextInput
                          placeholder="Registered Email"
                          placeholderTextColor={Colors.color.placeholder}
                          value={email}
                          onChangeText={(value) => setEmail(value)}
                          style={styles.textInput}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>

                      <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSendOtp}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color={Colors.color.white} />
                        ) : (
                          <CustomText style={styles.sendButtonText}>
                            SEND OTP
                          </CustomText>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    /* Step 2: OTP & Password Inputs */
                    <View style={styles.inputForm}>
                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons
                          name="shield-lock-outline"
                          size={28}
                          color={Colors.color.placeholder}
                        />
                        <TextInput
                          placeholder="6-digit OTP Code"
                          placeholderTextColor={Colors.color.placeholder}
                          value={otp}
                          onChangeText={(value) => setOtp(value)}
                          style={styles.textInput}
                          keyboardType="number-pad"
                          maxLength={6}
                        />
                      </View>

                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons
                          name="lock-outline"
                          size={28}
                          color={Colors.color.placeholder}
                        />
                        <TextInput
                          placeholder="New Password"
                          placeholderTextColor={Colors.color.placeholder}
                          value={newPassword}
                          onChangeText={(value) => setNewPassword(value)}
                          style={styles.textInput}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                          <MaterialCommunityIcons
                            name={showPassword ? "eye" : "eye-off"}
                            size={24}
                            color={Colors.color.placeholder}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons
                          name="lock-check-outline"
                          size={28}
                          color={Colors.color.placeholder}
                        />
                        <TextInput
                          placeholder="Confirm New Password"
                          placeholderTextColor={Colors.color.placeholder}
                          value={confirmPassword}
                          onChangeText={(value) => setConfirmPassword(value)}
                          style={styles.textInput}
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <MaterialCommunityIcons
                            name={showConfirmPassword ? "eye" : "eye-off"}
                            size={24}
                            color={Colors.color.placeholder}
                          />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleResetPassword}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color={Colors.color.white} />
                        ) : (
                          <CustomText style={styles.sendButtonText}>
                            RESET PASSWORD
                          </CustomText>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setStep(1)}
                        style={[styles.backButton, { marginTop: 10, alignSelf: 'center' }]}
                      >
                        <CustomText style={styles.backButtonText}>
                          Use a different email
                        </CustomText>
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                      router.replace("/LoginScreen");
                    }}
                  >
                    <CustomText style={styles.backButtonText}>
                      Back to Login
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default ForgotPasswordScreen;

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
    padding: 20,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 28,
    marginBottom: 10,
    color: Colors.color.primary,
  },
  eventText: {
    fontSize: 15,
    color: Colors.color.text,
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 15,
    lineHeight: 22,
  },
  inputForm: {
    width: "100%",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6f9",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
    width: "90%",
    height: 54,
    borderWidth: 1,
    borderColor: "#e1e5eb",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: Colors.color.text,
  },
  sendButton: {
    width: "90%",
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.color.primary,
    borderRadius: 27,
    marginBottom: 15,
    marginTop: 15,
    shadowColor: Colors.color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  sendButtonText: {
    color: Colors.color.white,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  backButton: {
    width: "90%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  backButtonText: {
    color: Colors.color.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
