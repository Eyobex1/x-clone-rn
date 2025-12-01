import { useCreatePost } from "@/hooks/useCreatePost";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const PostComposer = () => {
  const router = useRouter();

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

  return (
    <View className="border-b border-gray-100 p-4 bg-white">
      <View className="flex-row">
        {/* Profile Image → Navigate to Profile Tab */}
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          <Image
            source={{ uri: currentUser.profilePicture }}
            className="w-12 h-12 rounded-full mr-3"
          />
        </TouchableOpacity>

        {/* Text input */}
        <View className="flex-1">
          <TextInput
            className="text-gray-900 text-lg"
            placeholder={`What's happening, ${currentUser.firstName}?`}
            placeholderTextColor="#657786"
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={280}
          />
        </View>
      </View>

      {/* Selected Image Preview */}
      {selectedImage && (
        <View className="mt-3 ml-15">
          <View className="relative">
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-48 rounded-2xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-60 rounded-full items-center justify-center"
              onPress={removeImage}
            >
              <Feather name="x" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Controls */}
      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row">
          {/* Pick from gallery */}
          <TouchableOpacity className="mr-4" onPress={pickImageFromGallery}>
            <Feather name="image" size={20} color="#1DA1F2" />
          </TouchableOpacity>

          {/* Take photo */}
          <TouchableOpacity className="mr-4" onPress={takePhoto}>
            <Feather name="camera" size={20} color="#1DA1F2" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center">
          {/* Character counter */}
          {content.length > 0 && (
            <Text
              className={`text-sm mr-3 ${
                content.length > 260 ? "text-red-500" : "text-gray-500"
              }`}
            >
              {280 - content.length}
            </Text>
          )}

          {/* Post button */}
          <TouchableOpacity
            className={`px-6 py-2 rounded-full ${
              content.trim() || selectedImage ? "bg-blue-500" : "bg-gray-300"
            }`}
            onPress={createPost}
            disabled={isCreating || !(content.trim() || selectedImage)}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text
                className={`font-semibold ${
                  content.trim() || selectedImage
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PostComposer;
