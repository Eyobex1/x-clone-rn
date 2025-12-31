import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";

import EditProfileModal from "@/components/EditProfileModal";
import PostsList from "@/components/PostsList";
import PostComposer from "@/components/PostComposer";
import SignOutButton from "@/components/SignOutButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreens = () => {
  const router = useRouter();
  const { currentUser, isLoading } = useCurrentUser();
  const insets = useSafeAreaInsets();

  const {
    isEditModalVisible,
    openEditModal,
    closeEditModal,
    formData,
    saveProfile,
    updateFormField,
    isUpdating,
    refetch: refetchProfile,
  } = useProfile();

  const { posts } = usePosts(currentUser?.username);

  if (isLoading || !currentUser) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  const handleImagePress = (imageUri?: string) => {
    if (!imageUri) return;
    router.push({
      pathname: "/screens/image-viewer/image-viewer",
      params: { uri: encodeURIComponent(imageUri) },
    });
  };

  const goToUsersList = (type: "followers" | "following") => {
    router.push({
      pathname: "/screens/follower-list/follower-list",
      params: { type, username: currentUser.username },
    });
  };

  const renderProfileHeader = (
    <View>
      {/* Banner image */}
      <TouchableOpacity
        onPress={() => handleImagePress(currentUser.bannerImage)}
        disabled={!currentUser.bannerImage}
      >
        <Image
          source={{
            uri:
              currentUser.bannerImage ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
          }}
          className="w-full h-48"
          resizeMode="cover"
        />
      </TouchableOpacity>

      <View className="px-4 pb-4 border-b border-gray-100">
        {/* Profile picture + edit button */}
        <View className="flex-row justify-between items-end -mt-16 mb-4">
          <TouchableOpacity
            onPress={() => handleImagePress(currentUser.profilePicture)}
            disabled={!currentUser.profilePicture}
          >
            <Image
              source={{ uri: currentUser.profilePicture }}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="border border-gray-300 px-6 py-2 rounded-full"
            onPress={openEditModal}
          >
            <Text className="font-semibold text-gray-900">Edit profile</Text>
          </TouchableOpacity>
        </View>

        {/* User info */}
        <View className="mb-4">
          <View className="flex-row items-center mb-1">
            <Text className="text-xl font-bold text-gray-900 mr-1">
              {currentUser.firstName} {currentUser.lastName}
            </Text>
            <Feather name="check-circle" size={20} color="#1DA1F2" />
          </View>
          <Text className="text-gray-500 mb-2">@{currentUser.username}</Text>
          <Text className="text-gray-900 mb-3">{currentUser.bio}</Text>

          <View className="flex-row items-center mb-2">
            <Feather name="map-pin" size={16} color="#657786" />
            <Text className="text-gray-500 ml-2">{currentUser.location}</Text>
          </View>

          <View className="flex-row items-center mb-3">
            <Feather name="calendar" size={16} color="#657786" />
            <Text className="text-gray-500 ml-2">
              Joined {format(new Date(currentUser.createdAt), "MMMM yyyy")}
            </Text>
          </View>

          <View className="flex-row">
            <TouchableOpacity
              className="mr-6"
              onPress={() => goToUsersList("following")}
            >
              <Text className="text-gray-900">
                <Text className="font-bold">
                  {currentUser.following?.length}
                </Text>
                <Text className="text-gray-500"> Following</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => goToUsersList("followers")}>
              <Text className="text-gray-900">
                <Text className="font-bold">
                  {currentUser.followers?.length}
                </Text>
                <Text className="text-gray-500"> Followers</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const listHeader = (
    <View>
      {renderProfileHeader}
      <PostComposer />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View>
          <Text className="text-xl font-bold text-gray-900">
            {currentUser.firstName} {currentUser.lastName}
          </Text>
          <Text className="text-gray-500 text-sm">
            {posts?.length ?? 0} Posts
          </Text>
        </View>
        <SignOutButton />
      </View>

      <PostsList
        username={currentUser.username}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetchProfile}
            tintColor="#1DA1F2"
          />
        }
      />

      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={closeEditModal}
        formData={formData}
        saveProfile={saveProfile}
        updateFormField={updateFormField}
        isUpdating={isUpdating}
      />
    </SafeAreaView>
  );
};

export default ProfileScreens;
