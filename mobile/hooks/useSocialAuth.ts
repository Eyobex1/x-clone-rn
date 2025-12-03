import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { useApiClient, userApi } from "../utils/api";

/**
 * Custom hook to handle social authentication via Clerk
 * and ensure the user is synced with the backend database.
 */
export const useSocialAuth = () => {
  const [isLoading, setIsLoading] = useState(false); // Loading state for button/UI
  const { startSSOFlow } = useSSO(); // Clerk SSO function
  const api = useApiClient(); // API client for backend calls

  /**
   * Handles social login via Google or Apple
   * @param strategy "oauth_google" | "oauth_apple"
   */
  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setIsLoading(true); // Start loading

    try {
      // -----------------------------
      // Step 1: Start Clerk SSO flow
      // -----------------------------
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });

      if (!createdSessionId || !setActive) {
        throw new Error("Failed to create session");
      }

      // -----------------------------
      // Step 2: Activate Clerk session
      // -----------------------------
      await setActive({ session: createdSessionId });

      // -----------------------------
      // Step 3: Sync user with backend
      // -----------------------------
      try {
        const response = await userApi.syncUser(api);
        const user = response.data.user;
        const message = response.data.message; // e.g., "User already exists" or "User created successfully"

        // -----------------------------
        // Step 4: Show success/info toast
        // -----------------------------
        if (message === "User already exists") {
          Toast.show({
            type: "info",
            text1: "Welcome back!",
            text2: "Your account is already synced.",
          });
        } else {
          Toast.show({
            type: "success",
            text1: "Account Created",
            text2: "Your profile has been synced successfully.",
          });
        }

        // -----------------------------
        // Step 5: Navigate to Home screen
        // -----------------------------
        router.replace("/(tabs)"); // Redirect to main app tabs
      } catch (syncError: any) {
        console.error("Database sync failed:", syncError);

        // Show error toast
        Toast.show({
          type: "error",
          text1: "Sync Failed",
          text2: "Could not sync your account. Please sign in again.",
        });

        // Redirect back to auth screen
        router.replace("/(auth)");
      }
    } catch (err: any) {
      console.error("Social auth failed:", err);

      // Determine provider name for user-friendly message
      const provider = strategy === "oauth_google" ? "Google" : "Apple";

      // Show alert if social login failed
      Alert.alert(
        "Login Error",
        `Failed to sign in with ${provider}. Please try again.`
      );
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Return loading state and handler for UI usage
  return { isLoading, handleSocialAuth };
};
