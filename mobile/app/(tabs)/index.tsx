import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { View, Text, RefreshControl } from "react-native";
import PostsList from "@/components/PostsList";
import PostComposer from "@/components/PostComposer";
import SignOutButton from "@/components/SignOutButton";
import { Ionicons } from "@expo/vector-icons";
import { usePosts } from "@/hooks/usePosts";
import { useRef, useEffect } from "react";
import { FlatList } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const { posts, isLoading, refetch, hasNextPage, fetchNextPage } = usePosts();
  const navigation = useNavigation();

  // Listen for tab press
  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", (e) => {
      // Only scroll and refetch if we are already on the tab
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      refetch();
    });

    return unsubscribe;
  }, [navigation, refetch]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
        <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
        <Text className="text-xl font-bold text-gray-900">Home</Text>
        <SignOutButton />
      </View>

      {/* Posts feed with PostComposer as header */}
      <PostsList
        ref={flatListRef}
        ListHeaderComponent={<PostComposer />}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#1DA1F2"
          />
        }
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
