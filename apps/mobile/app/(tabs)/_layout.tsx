import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/theme"
import { Tabs } from "expo-router"

export default function TabLayout(){
    return (
        <Tabs screenOptions={{
            headerShown:false,
            tabBarActiveTintColor: Colors.color.primary,
            tabBarInactiveTintColor: Colors.color.placeholder,
            tabBarStyle: {height: 60, paddingBottom: 10},
        }}>
          <Tabs.Screen name="HomeScreen" options={{
            title: "Home",
            tabBarIcon: ({color}) => <Ionicons name="home" size={30} color={color}/>
          }}/>
          <Tabs.Screen name="DashBoardScreen" options={{
            title: "Dashboard",
            tabBarIcon: ({color}) => <Ionicons name="grid" size={30} color={color}/>
          }}/>
          <Tabs.Screen name="ScanQrScreen" options={{
            title: "Scan QR",
            tabBarIcon: ({color}) => <Ionicons name="qr-code" size={30} color={color}/>
          }}/>
          <Tabs.Screen name="SavedScreen" options={{
            title: "Saved",
            tabBarIcon: ({color}) => <Ionicons name="heart" size={30} color={color}/>
          }}/>
          <Tabs.Screen name="AccountScreen" options={{
            title: "Account",
            tabBarIcon: ({color}) => <Ionicons name="person" size={30} color={color}/>
          }}/>
        </Tabs>
    )
}
