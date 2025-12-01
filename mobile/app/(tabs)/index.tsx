import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";
import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import SignOutButton from "@/components/SignOutButton";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
        <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
        <Text className="text-xl font-bold text-gray-900">Home</Text>
        <SignOutButton />
      </View>

      <PostComposer />

      {/* Infinite scroll feed */}
      <PostsList />
    </SafeAreaView>
  );
};

export default HomeScreen;
