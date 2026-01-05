import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { UserProfile } from "@/types";

interface ProfileHeaderProps {
  user: UserProfile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  isMutating: boolean;
  onFollowToggle?: () => void;
  onImagePress?: (imageUri: string | undefined, isBanner?: boolean) => void;
  onNavigateToFollowList?: (type: "followers" | "following") => void;
  onEditProfile?: () => void; // ADD THIS PROP
  showFollowButton?: boolean;
}

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop";
const DEFAULT_AVATAR = "https://via.placeholder.com/150";

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwnProfile,
  isFollowing,
  isMutating,
  onFollowToggle,
  onImagePress,
  onNavigateToFollowList,
  onEditProfile, // ADD THIS
  showFollowButton = true,
}) => {
  const router = useRouter();

  const handleImagePress = (imageUri: string | undefined, isBanner = false) => {
    if (onImagePress) {
      onImagePress(imageUri, isBanner);
    } else {
      let finalUri = imageUri;
      if (!finalUri) {
        finalUri = isBanner ? DEFAULT_BANNER : DEFAULT_AVATAR;
      }

      if (finalUri && !finalUri.startsWith("http")) {
        finalUri = `https://your-backend.com${finalUri}`;
      }

      if (finalUri) {
        router.push(
          `/screens/image-viewer/image-viewer?uri=${encodeURIComponent(
            finalUri
          )}&t=${Date.now()}`
        );
      }
    }
  };

  const handleNavigateToFollowList = (type: "followers" | "following") => {
    if (onNavigateToFollowList) {
      onNavigateToFollowList(type);
    }
  };

  const followersCount = user.followers?.length || 0;
  const followingCount = user.following?.length || 0;

  // Format numbers with K/M abbreviations
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <View className="bg-white">
      {/* Clean Banner - Instagram style */}
      <TouchableOpacity
        onPress={() => handleImagePress(user.bannerImage, true)}
        activeOpacity={0.9}
        className="relative"
      >
        <Image
          source={{ uri: user.bannerImage || DEFAULT_BANNER }}
          className="w-full h-40"
          resizeMode="cover"
        />
        {/* Subtle top gradient for better text visibility */}
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "transparent"]}
          className="absolute top-0 left-0 right-0 h-20"
        />
      </TouchableOpacity>

      {/* Header Content - Below banner */}
      <View className="px-4 pb-4">
        {/* First Row: Profile Picture and Action Buttons */}
        <View className="flex-row justify-between items-start -mt-14 mb-4">
          {/* Profile Picture - Instagram large circle */}
          <TouchableOpacity
            onPress={() => handleImagePress(user.profilePicture)}
            activeOpacity={0.7}
            className="relative"
          >
            <View className="w-28 h-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
              <Image
                source={{ uri: user.profilePicture || DEFAULT_AVATAR }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            {/* Verified badge - X/Twitter style */}
            {followersCount > 10000 && (
              <View className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-500 items-center justify-center border-2 border-white">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Second Row: Name, Username, Bio */}
        <View className="mb-4">
          <Text className="text-xl font-black text-gray-900">
            {user.firstName} {user.lastName}
          </Text>
          <Text className="text-gray-500 text-sm mb-2">@{user.username}</Text>

          {user.bio && (
            <Text className="text-gray-800 text-sm leading-5">{user.bio}</Text>
          )}

          {/* Location and Join Date - Subtle */}
          {(user.location || user.createdAt) && (
            <View className="flex-row items-center flex-wrap gap-x-3 gap-y-1 mt-2">
              {user.location && (
                <View className="flex-row items-center">
                  <Feather name="map-pin" size={12} color="#6b7280" />
                  <Text className="text-gray-600 text-xs ml-1">
                    {user.location}
                  </Text>
                </View>
              )}
              {user.createdAt && (
                <View className="flex-row items-center">
                  <Feather name="calendar" size={12} color="#6b7280" />
                  <Text className="text-gray-600 text-xs ml-1">
                    Joined {new Date(user.createdAt).getFullYear()}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Third Row: Action Buttons - Now properly positioned */}
        <View className="flex-row space-x-2 mb-4">
          {!isOwnProfile && showFollowButton ? (
            <>
              {/* Follow Button - X/Twitter primary style */}
              <TouchableOpacity
                onPress={onFollowToggle}
                disabled={isMutating}
                className={`flex-1 py-3 rounded-full ${
                  isFollowing
                    ? "bg-transparent border border-gray-300"
                    : "bg-black"
                } ${isMutating ? "opacity-70" : ""}`}
                activeOpacity={0.8}
              >
                {isMutating ? (
                  <ActivityIndicator
                    size="small"
                    color={isFollowing ? "#000" : "#fff"}
                  />
                ) : (
                  <Text
                    className={`text-center font-bold text-sm ${
                      isFollowing ? "text-gray-900" : "text-white"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Message Button - Secondary */}
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: "/(tabs)/messages",
                    params: { username: user.username },
                  });
                }}
                className="flex-1 py-3 rounded-full border border-gray-300 bg-white"
                activeOpacity={0.7}
              >
                <Text className="text-center font-bold text-sm text-gray-900">
                  Message
                </Text>
              </TouchableOpacity>

              {/* More Options - Small icon button */}
              <TouchableOpacity
                className="w-12 rounded-full border border-gray-300 bg-white items-center justify-center"
                activeOpacity={0.7}
              >
                <Feather name="more-horizontal" size={20} color="#000" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Edit Profile - Instagram style - FIXED */}
              <TouchableOpacity
                className="flex-1 py-3 rounded-full border border-gray-300 bg-white"
                onPress={
                  onEditProfile || (() => router.push("/(tabs)/profile"))
                }
                activeOpacity={0.8}
              >
                <Text className="text-center font-bold text-sm text-gray-900">
                  Edit profile
                </Text>
              </TouchableOpacity>

              {/* Share Profile */}
              <TouchableOpacity
                className="w-12 rounded-full border border-gray-300 bg-white items-center justify-center"
                activeOpacity={0.7}
              >
                <Feather name="share" size={18} color="#000" />
              </TouchableOpacity>

              {/* Settings */}
              <TouchableOpacity
                className="w-12 rounded-full border border-gray-300 bg-white items-center justify-center"
                activeOpacity={0.7}
              >
                <Feather name="settings" size={18} color="#000" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Follow List Navigation - Clickable stats */}
        <View className="flex-row items-center justify-between py-3 border-t border-gray-100">
          <TouchableOpacity
            onPress={() => handleNavigateToFollowList("following")}
            activeOpacity={0.7}
            disabled={!onNavigateToFollowList}
            className="flex-1 items-center"
          >
            <Text className="text-gray-900 font-bold text-sm">
              {formatNumber(followingCount)} Following
            </Text>
          </TouchableOpacity>

          <View className="w-px h-4 bg-gray-200" />

          <TouchableOpacity
            onPress={() => handleNavigateToFollowList("followers")}
            activeOpacity={0.7}
            disabled={!onNavigateToFollowList}
            className="flex-1 items-center"
          >
            <Text className="text-gray-900 font-bold text-sm">
              {formatNumber(followersCount)} Followers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Bar - Instagram/TikTok style (simplified) */}
        <View className="border-t border-gray-100 pt-1">
          <View className="flex-row items-center justify-around">
            <TouchableOpacity className="items-center py-3 border-b-2 border-black flex-1">
              <Feather name="grid" size={20} color="#000" />
              <Text className="text-black font-semibold text-xs mt-1">
                Posts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center py-3 flex-1">
              <Feather name="video" size={20} color="#666" />
              <Text className="text-gray-500 font-medium text-xs mt-1">
                Videos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center py-3 flex-1">
              <Feather name="bookmark" size={20} color="#666" />
              <Text className="text-gray-500 font-medium text-xs mt-1">
                Saved
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center py-3 flex-1">
              <Feather name="tag" size={20} color="#666" />
              <Text className="text-gray-500 font-medium text-xs mt-1">
                Tagged
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;
