import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { View, Text, RefreshControl, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import PostsList from "@/components/PostsList";
import PostComposer from "@/components/PostComposer";
import SignOutButton from "@/components/SignOutButton";
import { usePosts } from "@/hooks/usePosts";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Define tab navigator types
type RootTabParamList = {
  Home: undefined;
  Profile: undefined;
  Search: undefined;
};

const HomeScreen = () => {
  const { currentUser } = useCurrentUser();
  console.log("Current User:", currentUser);

  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const { isLoading, refetch } = usePosts();
  const navigation = useNavigation();
  const tabNavigation =
    navigation.getParent<BottomTabNavigationProp<RootTabParamList>>();

  // Refresh & scroll to top only if Home tab is tapped while already on Home
  useEffect(() => {
    if (!tabNavigation) return;

    const unsubscribe = tabNavigation.addListener("tabPress", () => {
      if (tabNavigation.isFocused()) {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        refetch();
      }
    });

    return unsubscribe;
  }, [tabNavigation, refetch]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#E1E8ED",
        }}
      >
        <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#1C1C1C" }}>
          Home
        </Text>
        <SignOutButton />
      </View>

      {/* Posts feed */}
      {currentUser && (
        <PostsList
          ref={flatListRef}
          ListHeaderComponent={<PostComposer />}
          contentContainerStyle={{ paddingBottom: insets.bottom }} // safe area for bottom
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="#1DA1F2"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
