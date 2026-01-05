import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ProfileForm } from "@/hooks/useProfile";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  formData: ProfileForm;
  saveProfile: () => void;
  updateFormField: (field: keyof ProfileForm, value: string) => void;
  isUpdating: boolean;
}

const EditProfileModal = ({
  isVisible,
  onClose,
  formData,
  updateFormField,
  saveProfile,
  isUpdating,
}: EditProfileModalProps) => {
  const [selectedImageField, setSelectedImageField] = useState<
    "profilePicture" | "bannerImage" | null
  >(null);
  const [bioLength, setBioLength] = useState(formData.bio?.length || 0);

  /** Select image from gallery */
  const pickImage = async (field: "profilePicture" | "bannerImage") => {
    setSelectedImageField(field);

    // Request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to upload photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: field === "profilePicture" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      updateFormField(field, uri);
    }

    setSelectedImageField(null);
  };

  /** Take photo with camera */
  const takePhoto = async (field: "profilePicture" | "bannerImage") => {
    setSelectedImageField(field);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: field === "profilePicture" ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      updateFormField(field, uri);
    }

    setSelectedImageField(null);
  };

  const handleBioChange = (text: string) => {
    updateFormField("bio", text);
    setBioLength(text.length);
  };

  // Show image selection options
  const showImageOptions = (field: "profilePicture" | "bannerImage") => {
    Alert.alert(
      `Change ${field === "profilePicture" ? "Profile Picture" : "Cover Photo"}`,
      "Choose an option",
      [
        { text: "Take Photo", onPress: () => takePhoto(field) },
        { text: "Choose from Library", onPress: () => pickImage(field) },
        {
          text: "Remove Photo",
          onPress: () => updateFormField(field, ""),
          style: "destructive",
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        {/* Modern Header - Instagram/TikTok style */}
        <View className="border-b border-gray-100 bg-white pt-12 pb-3 px-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={onClose}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>

            <Text className="text-lg font-bold text-gray-900">
              Edit Profile
            </Text>

            <TouchableOpacity
              onPress={saveProfile}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-full ${
                isUpdating ? "bg-gray-200" : "bg-black"
              }`}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-sm">Done</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Banner Image Section - TikTok/Instagram style */}
          <View className="relative mb-20">
            {/* Banner Image */}
            <TouchableOpacity
              onPress={() => showImageOptions("bannerImage")}
              activeOpacity={0.8}
              className="relative"
            >
              {formData.bannerImage ? (
                <Image
                  source={{ uri: formData.bannerImage }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  className="w-full h-48"
                />
              )}

              {/* Edit overlay */}
              <View className="absolute inset-0 bg-black/30 items-center justify-center">
                <View className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <Feather name="camera" size={24} color="white" />
                </View>
                <Text className="text-white text-sm font-medium mt-2">
                  Edit cover photo
                </Text>
              </View>
            </TouchableOpacity>

            {/* Profile Picture - Floating over banner */}
            <View className="absolute -bottom-16 left-4">
              <TouchableOpacity
                onPress={() => showImageOptions("profilePicture")}
                activeOpacity={0.8}
                className="relative"
              >
                <View className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl">
                  {formData.profilePicture ? (
                    <Image
                      source={{ uri: formData.profilePicture }}
                      className="w-full h-full rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-500 items-center justify-center">
                      <Feather name="user" size={48} color="white" />
                    </View>
                  )}

                  {/* Edit icon overlay */}
                  <View className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-black items-center justify-center border-4 border-white">
                    <Feather name="edit-2" size={16} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields - Modern X/TikTok style */}
          <View className="px-4 space-y-6">
            {/* Full Name Row */}
            <View className="flex-row space-x-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-800 mb-2">
                  First Name
                </Text>
                <View className="border border-gray-200 rounded-xl bg-gray-50">
                  <TextInput
                    className="p-4 text-gray-900"
                    value={formData.firstName}
                    onChangeText={(t) => updateFormField("firstName", t)}
                    placeholder="First name"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-800 mb-2">
                  Last Name
                </Text>
                <View className="border border-gray-200 rounded-xl bg-gray-50">
                  <TextInput
                    className="p-4 text-gray-900"
                    value={formData.lastName}
                    onChangeText={(t) => updateFormField("lastName", t)}
                    placeholder="Last name"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>

            {/* Username - Read only */}
            <View>
              <Text className="text-sm font-semibold text-gray-800 mb-2">
                Username
              </Text>
              <View className="border border-gray-200 rounded-xl bg-gray-50 p-4">
                <Text className="text-gray-900">
                  @{formData.username || "username"}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                Username cannot be changed
              </Text>
            </View>

            {/* Bio with character counter - Twitter style */}
            <View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-gray-800">Bio</Text>
                <Text
                  className={`text-xs ${bioLength > 150 ? "text-red-500" : "text-gray-500"}`}
                >
                  {bioLength}/150
                </Text>
              </View>
              <View className="border border-gray-200 rounded-xl bg-gray-50">
                <TextInput
                  className="p-4 text-gray-900 min-h-[100px]"
                  value={formData.bio || ""}
                  onChangeText={handleBioChange}
                  placeholder="Tell your story..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  maxLength={150}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Location with icon - Instagram style */}
            <View>
              <Text className="text-sm font-semibold text-gray-800 mb-2">
                Location
              </Text>
              <View className="border border-gray-200 rounded-xl bg-gray-50">
                <View className="flex-row items-center p-4">
                  <Feather name="map-pin" size={18} color="#6b7280" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-900"
                    value={formData.location || ""}
                    onChangeText={(t) => updateFormField("location", t)}
                    placeholder="Add location"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Actions - Instagram style */}
          <View className="px-4 mt-8">
            <TouchableOpacity
              className="py-4 border-t border-gray-100 flex-row items-center justify-center"
              onPress={() => {
                // Clear all changes
                Alert.alert(
                  "Discard Changes",
                  "Are you sure you want to discard all changes?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Discard", style: "destructive", onPress: onClose },
                  ]
                );
              }}
            >
              <Feather name="trash-2" size={20} color="#ef4444" />
              <Text className="text-red-500 font-medium ml-2">
                Discard Changes
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Loading overlay for image selection */}
        {selectedImageField && (
          <View className="absolute inset-0 bg-black/70 items-center justify-center z-50">
            <View className="bg-white rounded-2xl p-8 items-center">
              <ActivityIndicator size="large" color="#000" />
              <Text className="text-gray-900 font-medium mt-4">
                Processing image...
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditProfileModal;
