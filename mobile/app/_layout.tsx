import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import Toast from "react-native-toast-message"; // <-- ADD THIS
import { View } from "react-native";

const publishableKey = Constants.expoConfig?.extra?.clerkPublishableKey;

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <QueryClientProvider client={queryClient}>
        {/* APP NAVIGATION */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <View
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Toast />
        </View>
        <StatusBar style="dark" />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
