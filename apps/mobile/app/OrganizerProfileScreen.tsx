import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
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
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserService } from "../axios/userService";
import NotificationBell from "@/components/NotificationBell";

type User = {
  full_name: string;
  email: string;
  phone_number: string | null;
  birthdate: string;
  avatar_url: string | null;
  created_at: string;
};

const OrganizerProfileScreen = () => {
  const { userId } = useLocalSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHostProfile = async () => {
      try {
        setLoading(true);
        const data = await UserService.getById(userId as string);
        setUser(data);
      } catch (e) {
        Alert.alert("Error", "Failed to load organizer profile");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchHostProfile();
  }, [userId]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={26} color={Colors.color.white} />
          </TouchableOpacity>
          <Text style={styles.connect}>
            <Text style={styles.event}>ORGANIZER </Text>PROFILE
          </Text>
          <View style={styles.Icon}>
            <NotificationBell />
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

              <View style={styles.infoCard}>
                <InfoRow
                  icon="phone-outline"
                  label="Phone"
                  value={user?.phone_number ?? "Not set"}
                />
                <InfoRow
                  icon="calendar-outline"
                  label="Birthdate"
                  value={formatDate(user?.birthdate ?? "")}
                />
                <InfoRow
                  icon="clock-outline"
                  label="Member since"
                  value={formatDate(user?.created_at ?? "")}
                />
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

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

export default OrganizerProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.color.white },
  header: {
    height: 60,
    alignItems: "center",
    backgroundColor: Colors.color.primary,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
  },
  backBtn: { paddingRight: 5 },
  connect: { fontSize: 18, color: Colors.color.white },
  event: { fontWeight: "700" },
  Icon: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginLeft: "auto",
  },
  body: { flex: 1, backgroundColor: Colors.color.background },
  bodyContent: { padding: 16, alignItems: "center" },
  loader: { marginTop: 60 },
  profileInfo: { alignItems: "center", marginVertical: 20 },
  avatarContainer: { marginBottom: 12 },
  profileImage: { height: 100, width: 100, borderRadius: 50 },
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
  profileName: { fontSize: 24, fontWeight: "bold", color: Colors.color.text },
  profileEmail: { fontSize: 14, color: Colors.color.placeholder, marginTop: 4 },
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
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: Colors.color.placeholder },
  infoValue: { fontSize: 16, color: Colors.color.text, fontWeight: "500" },
});
