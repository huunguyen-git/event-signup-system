import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { Tabs } from "expo-router";

export default function TabLayout() {
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
          title: "Dashboard",
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
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="event" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ScanQrScreen"
        options={{
          title: "Scan QR",
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
