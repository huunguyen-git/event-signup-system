import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
// import { userApi } from "@/services/api/user";
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
        >
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
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
            <Text style={styles.label}>Phone Number</Text>
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
            <Text style={styles.label}>Birthdate</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons
                name="calendar-outline"
                size={22}
                color={Colors.color.placeholder}
              />
              <Text
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
              </Text>
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
            <Text style={styles.label}>Avatar URL</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="image-outline"
                size={22}
                color={Colors.color.placeholder}
              />
              <TextInput
                style={styles.input}
                value={avatarUrl}
                onChangeText={setAvatarUrl}
                placeholder="Paste an image URL"
                placeholderTextColor={Colors.color.placeholder}
                autoCapitalize="none"
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
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
    fontWeight: "600",
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
    fontWeight: "600",
    color: Colors.color.text,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.color.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.color.text,
  },
  saveButton: {
    height: 50,
    backgroundColor: Colors.color.primary,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: Colors.color.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
