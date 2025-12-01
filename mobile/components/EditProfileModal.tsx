import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  formData: {
    firstName: string;
    lastName: string;
    bio: string;
    location: string;
    profilePicture?: string;
    bannerImage?: string;
  };
  saveProfile: () => void;
  updateFormField: (field: string, value: string) => void;
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
  // Pick image from gallery
  const pickImage = async (field: "profilePicture" | "bannerImage") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: undefined,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      updateFormField(field, selectedImageUri);
    }
  };

  const handleSave = () => {
    saveProfile();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-blue-500 text-lg">Cancel</Text>
        </TouchableOpacity>

        <Text className="text-lg font-semibold">Edit Profile</Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isUpdating}
          className={`${isUpdating ? "opacity-50" : ""}`}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#1DA1F2" />
          ) : (
            <Text className="text-blue-500 text-lg font-semibold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Banner Image */}
        <TouchableOpacity
          onPress={() => pickImage("bannerImage")}
          className="mb-4"
        >
          <Text className="text-blue-500 mb-2">Change Cover Photo</Text>
          {formData.bannerImage ? (
            <Image
              source={{ uri: formData.bannerImage }}
              className="w-full h-32 rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-32 bg-gray-200 rounded-lg justify-center items-center">
              <Text className="text-gray-500">No cover image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Picture */}
        <TouchableOpacity
          onPress={() => pickImage("profilePicture")}
          className="mb-6"
        >
          <Text className="text-blue-500 mb-2">Change Profile Picture</Text>
          {formData.profilePicture ? (
            <Image
              source={{ uri: formData.profilePicture }}
              className="w-32 h-32 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-32 h-32 bg-gray-200 rounded-full justify-center items-center">
              <Text className="text-gray-500">No profile picture</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Text fields */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-500 text-sm mb-2">First Name</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 text-base"
              value={formData.firstName}
              onChangeText={(text) => updateFormField("firstName", text)}
              placeholder="Your first name"
            />
          </View>

          <View>
            <Text className="text-gray-500 text-sm mb-2">Last Name</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 text-base"
              value={formData.lastName}
              onChangeText={(text) => updateFormField("lastName", text)}
              placeholder="Your last name"
            />
          </View>

          <View>
            <Text className="text-gray-500 text-sm mb-2">Bio</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 text-base"
              value={formData.bio}
              onChangeText={(text) => updateFormField("bio", text)}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View>
            <Text className="text-gray-500 text-sm mb-2">Location</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 text-base"
              value={formData.location}
              onChangeText={(text) => updateFormField("location", text)}
              placeholder="Where are you located?"
            />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default EditProfileModal;
