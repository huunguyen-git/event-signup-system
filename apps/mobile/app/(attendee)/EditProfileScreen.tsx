import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import ImageCropPicker from 'react-native-image-crop-picker';
import { getToken } from "@/services/storage";
import { UserService } from "../../axios/userService";

const EditProfileScreen = () => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    try {
      const result = await ImageCropPicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,               
        cropperCircleOverlay: true,   
        mediaType: 'photo',           
        compressImageQuality: 0.8,    
        forceJpg: true,               
      });

      if (result && result.path) {
        setAvatarUrl(result.path);
      }
    } catch (error: any) {
      if (error?.message !== "User cancelled image selection") {
        Alert.alert("Error", error?.message || "Failed to pick image");
      }
    }
  };

  // Load current values on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await getToken();
        if (!token) {
          router.replace("/LoginScreen");
          return;
        }
        const data = await UserService.getMe(token);
        setFullName(data.full_name ?? "");
        setPhoneNumber(data.phone_number ?? "");
        setAvatarUrl(data.avatar_url ?? "");
        setDescription(data.description ?? "");
        if (data.birthdate) setBirthdate(new Date(data.birthdate));
      } catch (e: any) {
        console.log("Error loading profile:", e);
        if (e.response?.status === 401) {
          Alert.alert("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại.", [
            {
              text: "Đăng nhập",
              onPress: async () => {
                router.replace("/LoginScreen");
              },
            },
          ]);
        } else {
          Alert.alert("Error", "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!fullName) {
      Alert.alert("Error", "Full name is required");
      return;
    }

    try {
      setSaving(true);
      const token = await getToken();
      await UserService.updateMe(token!, {
        full_name: fullName,
        phone_number: phoneNumber || undefined,
        avatar_url: avatarUrl || undefined,
        birthdate: birthdate
          ? birthdate.toISOString().split("T")[0]
          : undefined,
        description: description || undefined,
      });
      Alert.alert("Success", "Profile updated", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={Colors.color.primary}
          style={styles.loader}
        />
      </SafeAreaView>
    );
  }

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
                Edit Profile
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
                    Full Name
                  </CustomText>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={22}
                      color={Colors.color.placeholder}
                    />
                    <TextInput
                      style={styles.input}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Enter your full name"
                      placeholderTextColor={Colors.color.placeholder}
                    />
                  </View>
                </View>
                <View style={styles.field}>
                  <CustomText variant="medium" style={styles.label}>
                    Avatar
                  </CustomText>
                  <TouchableOpacity
                    style={[
                      styles.avatarContainer,
                      avatarUrl ? styles.avatarActive : null,
                    ]}
                    onPress={pickImage}
                  >
                    {avatarUrl ? (
                      <View style={styles.avatarImageWrapper}>
                        <Image
                          source={{ uri: avatarUrl }}
                          style={styles.avatarImageCircular}
                        />
                        <CustomText variant="medium" style={styles.avatarChangeText}>
                          Tap to change photo
                        </CustomText>
                      </View>
                    ) : (
                      <View style={styles.uploadPlaceholder}>
                        <View style={styles.cameraCircle}>
                          <Ionicons name="camera-outline" size={24} color="#FFF" />
                        </View>
                        <CustomText variant="medium" style={styles.uploadMainText}>
                          Tap to select photo
                        </CustomText>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.field}>
                  <CustomText variant="medium" style={styles.label}>
                    Phone Number
                  </CustomText>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="phone-outline"
                      size={22}
                      color={Colors.color.placeholder}
                    />
                    <TextInput
                      style={styles.input}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="Enter your phone number"
                      placeholderTextColor={Colors.color.placeholder}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <CustomText variant="medium" style={styles.label}>
                    Birthdate
                  </CustomText>
                  <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <MaterialCommunityIcons
                      name="calendar-outline"
                      size={22}
                      color={Colors.color.placeholder}
                    />
                    <CustomText
                      style={[
                        styles.input,
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
                        if (date) setBirthdate(date);
                      }}
                    />
                  )}
                </View>

                
                <View style={styles.field}>
                  <CustomText variant="medium" style={styles.label}>
                    Description
                  </CustomText>
                  <View style={[styles.inputContainer, { alignItems: "flex-start" }]}>
                    <MaterialCommunityIcons
                      name="card-text-outline"
                      size={22}
                      color={Colors.color.placeholder}
                      style={{ marginTop: Platform.OS === "ios" ? 2 : 4 }}
                    />
                    <TextInput
                      style={[styles.input, { textAlignVertical: "top", minHeight: 80 }]}
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Enter your description"
                      placeholderTextColor={Colors.color.placeholder}
                      multiline={true}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={Colors.color.white} />
                  ) : (
                    <CustomText variant="medium" style={styles.saveButtonText}>
                      Save Changes
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

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color.white,
  },
  loader: {
    flex: 1,
    marginTop: 60,
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
    marginTop: 16,
    shadowColor: Colors.color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonText: {
    color: Colors.color.white,
    fontSize: 16,
  },
  avatarContainer: {
    height: 140,
    borderWidth: 1,
    borderColor: "#cccccccb",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: Colors.color.white,
    width: "100%",
  },
  avatarActive: {
    borderStyle: "solid",
    borderColor: Colors.color.primary,
  },
  avatarImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImageCircular: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#eee",
  },
  avatarChangeText: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
  },
  uploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  cameraCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.color.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  uploadMainText: {
    fontSize: 14,
    color: Colors.color.text,
  },
});
