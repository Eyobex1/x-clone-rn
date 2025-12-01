import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { FlatList, View, Text, RefreshControl } from "react-native";
import PostsList from "@/components/PostsList";
import PostComposer from "@/components/PostComposer";
import SignOutButton from "@/components/SignOutButton";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
        <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
        <Text className="text-xl font-bold text-gray-900">Home</Text>
        <SignOutButton />
      </View>

      {/* Feed with PostComposer as FlatList header */}
      <PostsList
        ListHeaderComponent={<PostComposer />}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
