// hooks/useProfile.ts
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";
import { useCurrentUser } from "./useCurrentUser";
import Toast from "react-native-toast-message";

/**
 * Custom hook for managing user profile operations
 */
export const useProfile = () => {
  const api = useApiClient(); // Axios instance
  const queryClient = useQueryClient();

  // State for controlling edit profile modal visibility
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Form state for editing profile
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
  });

  // Current logged-in user
  const { currentUser } = useCurrentUser();

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: any) => userApi.updateProfile(api, profileData),
    onSuccess: () => {
      // Refresh user data after update
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setIsEditModalVisible(false);

      // Show success toast
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully!",
      });
    },
    onError: (error: any) => {
      // Show error toast
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.error || "Failed to update profile",
      });
    },
  });

  /**
   * Open edit profile modal and populate form fields with current user data
   */
  const openEditModal = () => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
      });
    }
    setIsEditModalVisible(true);
  };

  /**
   * Update a single field in the profile form
   * @param field - form field name
   * @param value - new value for the field
   */
  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    // Modal state
    isEditModalVisible,
    // Form state
    formData,
    // Handlers
    openEditModal,
    closeEditModal: () => setIsEditModalVisible(false),
    saveProfile: () => updateProfileMutation.mutate(formData),
    updateFormField,
    // Status flags
    isUpdating: updateProfileMutation.isPending,
    // Refetch user data manually
    refetch: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  };
};
