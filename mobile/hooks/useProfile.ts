import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";
import { useCurrentUser } from "./useCurrentUser";
import Toast from "react-native-toast-message";

/** Valid form fields */
export interface ProfileForm {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  profilePicture?: string;
  bannerImage?: string;
}

export const useProfile = () => {
  const api = useApiClient(); // axios instance
  const queryClient = useQueryClient();

  /** Edit modal state */
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  /** Profile edit form */
  const [formData, setFormData] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    profilePicture: "",
    bannerImage: "",
  });

  const { currentUser } = useCurrentUser();

  /** Update profile API call */
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: FormData) =>
      userApi.updateProfile(api, profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setIsEditModalVisible(false);

      Toast.show({
        type: "success",
        text1: "Profile Updated",
        text2: "Your profile was updated successfully.",
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.response?.data?.error || "Something went wrong",
      });
    },
  });

  /** Open edit modal & fill form with current profile */
  const openEditModal = () => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
        profilePicture: currentUser.profilePicture || "",
        bannerImage: currentUser.bannerImage || "",
      });
    }
    setIsEditModalVisible(true);
  };

  /** Update a single form field */
  const updateFormField = (field: keyof ProfileForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /** Save profile changes */
  const saveProfile = () => {
    const form = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (!value) return;

      // Only upload if file is a local URI
      if (
        (key === "profilePicture" || key === "bannerImage") &&
        value.startsWith("file://")
      ) {
        form.append(key, {
          uri: value,
          name: `${key}.jpg`,
          type: "image/jpeg",
        } as any);
      } else {
        form.append(key, value);
      }
    });

    updateProfileMutation.mutate(form);
  };

  return {
    isEditModalVisible,
    formData,
    openEditModal,
    closeEditModal: () => setIsEditModalVisible(false),
    updateFormField,
    saveProfile,
    isUpdating: updateProfileMutation.isPending,

    /** Manual refresh */
    refetch: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  };
};
