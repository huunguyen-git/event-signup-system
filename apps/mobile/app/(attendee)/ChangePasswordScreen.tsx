import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { getToken } from "@/services/storage";
import { AuthService } from "../../axios/authService";

const ChangePasswordScreen = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleChangePassword = async () => {
    if (!oldPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu hiện tại");
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
    if (oldPassword === newPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới không được trùng với mật khẩu hiện tại");
      return;
    }

    try {
      setSaving(true);
      const token = await getToken();
      if (!token) {
        Alert.alert("Lỗi", "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.", [
          { text: "OK", onPress: () => router.replace("/LoginScreen") },
        ]);
        return;
      }

      await AuthService.changePassword(token, oldPassword, newPassword);

      Alert.alert("Thành công", "Đổi mật khẩu thành công!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ."
      );
    } finally {
      setSaving(false);
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
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={28}
                  color={Colors.color.white}
                />
              </TouchableOpacity>
              <CustomText variant="bold" style={styles.headerTitle}>
                Change Password
              </CustomText>
            </View>

            <ScrollView
              style={styles.body}
              contentContainerStyle={[styles.bodyContent, { flexGrow: 1 }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                  <View style={styles.field}>
                    <CustomText variant="medium" style={styles.label}>
                      Current Password
                    </CustomText>
                    <View style={styles.inputContainer}>
                      <MaterialCommunityIcons
                        name="lock-outline"
                        size={22}
                        color={Colors.color.placeholder}
                      />
                      <TextInput
                        style={styles.input}
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        placeholder="Enter current password"
                        placeholderTextColor={Colors.color.placeholder}
                        secureTextEntry={!showOldPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                        <MaterialCommunityIcons
                          name={showOldPassword ? "eye" : "eye-off"}
                          size={20}
                          color={Colors.color.placeholder}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.field}>
                    <CustomText variant="medium" style={styles.label}>
                      New Password
                    </CustomText>
                    <View style={styles.inputContainer}>
                      <MaterialCommunityIcons
                        name="lock-plus-outline"
                        size={22}
                        color={Colors.color.placeholder}
                      />
                      <TextInput
                        style={styles.input}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password (min 8 chars)"
                        placeholderTextColor={Colors.color.placeholder}
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                        <MaterialCommunityIcons
                          name={showNewPassword ? "eye" : "eye-off"}
                          size={20}
                          color={Colors.color.placeholder}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.field}>
                    <CustomText variant="medium" style={styles.label}>
                      Confirm New Password
                    </CustomText>
                    <View style={styles.inputContainer}>
                      <MaterialCommunityIcons
                        name="lock-check-outline"
                        size={22}
                        color={Colors.color.placeholder}
                      />
                      <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                        placeholderTextColor={Colors.color.placeholder}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <MaterialCommunityIcons
                          name={showConfirmPassword ? "eye" : "eye-off"}
                          size={20}
                          color={Colors.color.placeholder}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleChangePassword}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color={Colors.color.white} />
                    ) : (
                      <CustomText variant="medium" style={styles.saveButtonText}>
                        Update Password
                      </CustomText>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color.white,
  },
  header: {
    height: 60,
    backgroundColor: Colors.color.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 16,
  },
  headerTitle: {
    fontSize: 18,
    color: Colors.color.white,
  },
  body: {
    flex: 1,
    backgroundColor: Colors.color.background,
  },
  bodyContent: {
    padding: 16,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: Colors.color.text,
    marginLeft: 4,
    marginBottom: 4,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.color.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.color.text,
  },
  saveButton: {
    height: 54,
    backgroundColor: Colors.color.primary,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    shadowColor: Colors.color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonText: {
    color: Colors.color.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
