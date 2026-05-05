import {Stack} from "expo-router"
import { Colors } from "../constants/theme";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{
                headerShown: false,
                headerStyle: { backgroundColor: Colors.color.primary },
                headerTintColor: Colors.color.white,
            }}>
                <Stack.Screen name="(Auth)/LoginScreen" options={{ headerShown: false }}/>
                <Stack.Screen name="(attendee)" options={{ headerShown: false }}/>
            </Stack>
        </GestureHandlerRootView>
    )
};
