import React from "react";
import { View, Text, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import EditProfileModal from "@/components/EditProfileModal";
import PostsList from "@/components/PostsList";
import PostComposer from "@/components/PostComposer";
import SignOutButton from "@/components/SignOutButton";
import ProfileHeader from "@/components/ProfileHeader";
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
    openEditModal, // This is the function you need to pass
    closeEditModal,
    formData,
    saveProfile,
    updateFormField,
    isUpdating,
    refetch: refetchProfile,
  } = useProfile();

  const { posts } = usePosts(currentUser?.username);

  const goToUsersList = (type: "followers" | "following") => {
    router.push({
      pathname: "/screens/follower-list/follower-list",
      params: { type, username: currentUser.username },
    });
  };

  if (isLoading || !currentUser) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  const renderProfileHeader = (
    <ProfileHeader
      user={currentUser}
      isOwnProfile={true}
      isFollowing={false}
      isMutating={false}
      onNavigateToFollowList={goToUsersList}
      onEditProfile={openEditModal} // PASS THE FUNCTION HERE
      showFollowButton={false}
    />
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
