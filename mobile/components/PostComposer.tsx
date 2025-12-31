import { useCreatePost } from "@/hooks/useCreatePost";
import {
  Feather,
  Ionicons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { BlurView } from "expo-blur";

const PostComposer = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    content,
    setContent,
    selectedImage,
    isCreating,
    pickImageFromGallery,
    takePhoto,
    removeImage,
    createPost,
  } = useCreatePost();

  const { currentUser } = useCurrentUser();

  if (!currentUser) return null;

  const handlePost = async () => {
    if (!content.trim() && !selectedImage) {
      Alert.alert(
        "Empty Post",
        "Please write something or add an image to post."
      );
      return;
    }

    try {
      await createPost();
      setIsExpanded(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const toggleComposer = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setContent("");
    }
  };

  return (
    <View className="bg-white border-b border-gray-100">
      {/* Collapsed State */}
      {!isExpanded ? (
        <TouchableOpacity
          onPress={toggleComposer}
          className="flex-row items-center p-4 border-b border-gray-50"
        >
          <Image
            source={{
              uri:
                currentUser.profilePicture || "https://i.pravatar.cc/150?img=1",
            }}
            className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm"
          />
          <View className="flex-1 bg-gray-100 rounded-full px-4 py-3">
            <Text className="text-gray-500 text-[15px]">
              What's on your mind, {currentUser.firstName}?
            </Text>
          </View>
          <TouchableOpacity className="ml-3 p-2">
            <Feather name="image" size={22} color="#007AFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        /* Expanded State */
        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Create Post</Text>
            <TouchableOpacity
              onPress={toggleComposer}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={22} color="#8e8e93" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View className="flex-row items-center mb-4">
            <Image
              source={{
                uri:
                  currentUser.profilePicture ||
                  "https://i.pravatar.cc/150?img=1",
              }}
              className="w-12 h-12 rounded-full mr-3 border-2 border-white shadow-sm"
            />
            <View>
              <Text className="font-bold text-gray-900 text-[16px]">
                {currentUser.firstName} {currentUser.lastName}
              </Text>
              <View className="flex-row items-center bg-blue-50 rounded-full px-3 py-1 mt-1">
                <Feather name="globe" size={12} color="#007AFF" />
                <Text className="text-blue-600 text-xs font-medium ml-1">
                  Public
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={12}
                  color="#007AFF"
                  className="ml-1"
                />
              </View>
            </View>
          </View>

          {/* Text Input */}
          <ScrollView className="max-h-60" showsVerticalScrollIndicator={false}>
            <TextInput
              className="text-gray-900 text-[16px] leading-6"
              placeholder="What's on your mind?"
              placeholderTextColor="#8e8e93"
              multiline
              value={content}
              onChangeText={setContent}
              maxLength={500}
              autoFocus
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Selected Image Preview */}
          {selectedImage && (
            <View className="mt-4 rounded-2xl overflow-hidden bg-gray-100">
              <View className="relative">
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-64"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  className="absolute top-3 right-3 w-10 h-10 bg-black/60 rounded-full items-center justify-center"
                  onPress={removeImage}
                >
                  <Feather name="x" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Character Counter */}
          {content.length > 0 && (
            <View className="flex-row justify-end mt-3">
              <Text
                className={`text-sm ${content.length > 450 ? "text-red-500" : "text-gray-500"}`}
              >
                {content.length}/500
              </Text>
            </View>
          )}

          {/* Media Attachments */}
          <View className="flex-row items-center justify-between mt-6 p-4 bg-gray-50 rounded-2xl">
            <Text className="font-medium text-gray-700">Add to your post</Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={pickImageFromGallery}
                className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center"
              >
                <Feather name="image" size={22} color="#007AFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePhoto}
                className="w-12 h-12 rounded-full bg-green-100 items-center justify-center"
              >
                <Feather name="camera" size={22} color="#34C759" />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center"
                onPress={() =>
                  Alert.alert("Coming Soon", "Video upload coming soon!")
                }
              >
                <Feather name="video" size={22} color="#5856D6" />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center"
                onPress={() =>
                  Alert.alert("Coming Soon", "Poll feature coming soon!")
                }
              >
                <FontAwesome5 name="poll" size={20} color="#FF9500" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Post Button */}
          <View className="mt-6">
            <TouchableOpacity
              className={`w-full py-4 rounded-xl ${content.trim() || selectedImage ? "bg-blue-500" : "bg-gray-300"} items-center justify-center`}
              onPress={handlePost}
              disabled={isCreating || !(content.trim() || selectedImage)}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-[16px]">Post</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Tips */}
          <View className="mt-4 flex-row items-center justify-center">
            <MaterialIcons name="lightbulb" size={16} color="#FFCC00" />
            <Text className="text-gray-500 text-sm ml-2">
              Tip: Keep it positive and engaging!
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default PostComposer;
