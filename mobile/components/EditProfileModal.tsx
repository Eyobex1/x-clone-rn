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
import { ProfileForm } from "@/hooks/useProfile";

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
  /** Select image from gallery */
  const pickImage = async (field: "profilePicture" | "bannerImage") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // correct
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      updateFormField(field, uri);
    }
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
          onPress={saveProfile}
          disabled={isUpdating}
          className={isUpdating ? "opacity-50" : ""}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#1DA1F2" />
          ) : (
            <Text className="text-blue-500 text-lg font-semibold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="px-4 py-6"
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
            />
          ) : (
            <View className="w-32 h-32 bg-gray-200 rounded-full justify-center items-center">
              <Text className="text-gray-500">No profile picture</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Text Fields */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-500 text-sm mb-2">First Name</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3"
              value={formData.firstName}
              onChangeText={(t) => updateFormField("firstName", t)}
            />
          </View>

          <View>
            <Text className="text-gray-500 text-sm mb-2">Last Name</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3"
              value={formData.lastName}
              onChangeText={(t) => updateFormField("lastName", t)}
            />
          </View>

          <View>
            <Text className="text-gray-500 text-sm mb-2">Bio</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3"
              value={formData.bio}
              onChangeText={(t) => updateFormField("bio", t)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View>
            <Text className="text-gray-500 text-sm mb-2">Location</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3"
              value={formData.location}
              onChangeText={(t) => updateFormField("location", t)}
            />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default EditProfileModal;
