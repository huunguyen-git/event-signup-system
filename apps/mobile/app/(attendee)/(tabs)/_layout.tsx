import { useEffect, useState } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { Tabs } from "expo-router";
import { getUserRole } from "@/services/storage";

export default function TabLayout() {
  const [role, setRole] = useState<string>("STUDENT");

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const storedRole = await getUserRole();
        if (storedRole) {
          setRole(storedRole);
        }
      } catch (err) {
        console.log("Error loading role in TabLayout:", err);
      }
    };
    fetchRole();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.color.primary,
        tabBarInactiveTintColor: Colors.color.placeholder,
        tabBarStyle: { height: 60, paddingBottom: 10 },
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="DashBoardScreen"
        options={{
          title: "Registered",
          href: role === "FACULTY" ? null : undefined,
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="admin-panel-settings"
              size={30}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="HostDashBoardScreen"
        options={{
          title: "My Events",
          href: role === "CLUB" ? undefined : null,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="event" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ApproveEventsScreen"
        options={{
          title: "Approve",
          href: role === "FACULTY" ? undefined : null,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="verified-user" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ScanQrScreen"
        options={{
          title: "Scan QR",
          href: role === "FACULTY" ? null : undefined,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="qr-code-scanner" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="AccountScreen"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={30} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
