import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
// import { userApi, authApi } from "@/services/api";
import { getToken, removeToken } from "@/services/storage";
import { UserService } from "../../../axios/userService";
import { AuthService } from "../../../axios/authService";
import { ResponseUser } from "../../../axios/dto/responseUserModel";

type User = {
  full_name: string;
  email: string;
  phone_number: string | null;
  birthdate: string;
  avatar_url: string | null;
  created_at: string;
};

const AccountScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const token = await getToken();
          if (!token) {
            router.replace("/LoginScreen");
            return;
          }
          const data = await UserService.getMe(token);
          setUser(data);
        } catch (e) {
          Alert.alert("Error", "Failed to load profile");
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }, []),
  );
  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            if (token != null) {
              await AuthService.logout(token);
            }
          } catch (e) {
            Alert.alert("Error", "Failed to log out");
          } finally {
            await removeToken();
            router.replace("/LoginScreen");
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="domain"
            size={40}
            color={Colors.color.white}
          />
          <Text style={styles.connect}>
            <Text style={styles.event}>EVENT </Text>CONNECT
          </Text>
          <View style={styles.Icon}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={40}
              color={Colors.color.white}
            />
          </View>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color={Colors.color.primary}
              style={styles.loader}
            />
          ) : (
            <>
              {/* Avatar + Name */}
              <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                  {user?.avatar_url ? (
                    <Image
                      source={{ uri: user.avatar_url }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitial}>
                        {user?.full_name?.charAt(0).toUpperCase() ?? "?"}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.profileName}>{user?.full_name}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>

              {/* Info Cards */}
              <View style={styles.infoCard}>
                <InfoRow
                  icon="phone-outline"
                  label="Phone"
                  value={user?.phone_number ?? "Not set"}
                />
                <InfoRow
                  icon="calendar-outline"
                  label="Birthdate"
                  value={user?.birthdate ? formatDate(user.birthdate) : "-"}
                />
                <InfoRow
                  icon="clock-outline"
                  label="Member since"
                  value={user?.created_at ? formatDate(user.created_at) : "-"}
                />
              </View>

              {/* Buttons */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push("/(attendee)/EditProfileScreen")}
              >
                <MaterialCommunityIcons
                  name="account-edit-outline"
                  size={20}
                  color={Colors.color.white}
                />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={20}
                  color={Colors.color.primary}
                />
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

// Small helper component for info rows
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons
      name={icon}
      size={22}
      color={Colors.color.primary}
    />
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color.white,
  },
  header: {
    height: 60,
    alignItems: "center",
    backgroundColor: Colors.color.primary,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
  },
  connect: {
    fontSize: 18,
    color: Colors.color.white,
  },
  event: {
    fontWeight: "700",
  },
  Icon: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginLeft: "auto",
  },
  body: {
    flex: 1,
    backgroundColor: Colors.color.background,
  },
  bodyContent: {
    padding: 16,
    alignItems: "center",
  },
  loader: {
    marginTop: 60,
  },
  profileInfo: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  profileImage: {
    height: 100,
    width: 100,
    borderRadius: 50,
  },
  avatarFallback: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: Colors.color.lightblue,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: "bold",
    color: Colors.color.primary,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.color.text,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.color.placeholder,
    marginTop: 4,
  },
  infoCard: {
    width: "100%",
    backgroundColor: Colors.color.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.color.placeholder,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.color.text,
    fontWeight: "500",
  },
  editButton: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.color.primary,
    borderRadius: 30,
    gap: 8,
    marginBottom: 12,
  },
  editButtonText: {
    color: Colors.color.white,
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.color.primary,
    borderRadius: 30,
    gap: 8,
  },
  logoutButtonText: {
    color: Colors.color.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
