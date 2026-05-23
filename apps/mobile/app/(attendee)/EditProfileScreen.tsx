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
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { getToken } from "@/services/storage";
import { UserService } from "../../axios/userService";

const EditProfileScreen = () => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,       
        allowsEditing: true,
        aspect: [1,1],
        quality: 1,
      });
  
      if (!result.canceled) {
        setAvatarUrl(result.assets[0].uri);
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
        if (data.birthdate) setBirthdate(new Date(data.birthdate));
      } catch (e) {
        Alert.alert("Error", "Failed to load profile");
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color={Colors.color.white}
            />
          </TouchableOpacity>
          <CustomText variant="bold" style={styles.headerTitle}>Edit Profile</CustomText>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
        >
          <View style={styles.field}>
            <CustomText variant="medium" style={styles.label}>Full Name</CustomText>
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
            <CustomText variant="medium" style={styles.label}>Phone Number</CustomText>
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
            <CustomText variant="medium" style={styles.label}>Birthdate</CustomText>
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
            <CustomText variant="medium" style={styles.label}>Avatar URL</CustomText>
            <TouchableOpacity
            style={[styles.imageContainer, avatarUrl && styles.imageActive]}
            onPress={pickImage}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.previewImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={styles.cameraCircle}>
                  <Ionicons name="camera-outline" size={24} color="#FFF" />
                </View>
                <CustomText variant="medium" style={styles.uploadMainText}>Tap to add</CustomText>
                <CustomText style={styles.uploadSubText}>Recommended (1:1)</CustomText>
              </View>
            )}
          </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.color.white} />
            ) : (
              <CustomText variant="medium" style={styles.saveButtonText}>Save Changes</CustomText>
            )}
          </TouchableOpacity>
        </ScrollView>
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
  imageContainer: {
      height: 120,
      borderWidth: 1,
      borderColor: "#cccccccb",
      borderStyle: "dashed",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      overflow: "hidden",
      backgroundColor: "#FFF",
    },
    imageActive: {
      borderStyle: "solid",
      borderColor: "#1a2a44",
    },
    uploadPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
    },
    cameraCircle: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: "#1a2a44",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    uploadMainText: {
      fontSize: 14,
      color: "#333",
    },
    uploadSubText: {
      fontSize: 12,
      color: "#888",
      marginTop: 2,
    },
    previewImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
});
