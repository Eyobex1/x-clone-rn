import { Feather } from "@expo/vector-icons";
import {
  View,
  TextInput,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useSearchUsers } from "@/hooks/useSearchUsers";
import { useRouter } from "expo-router";

const DEFAULT_AVATAR = "https://via.placeholder.com/150";

const TRENDING_TOPICS = [
  { topic: "#Eyob Tekle", tweets: "1.3M" },
  { topic: "#ReactNative", tweets: "125K" },
  { topic: "#TypeScript", tweets: "89K" },
  { topic: "#WebDevelopment", tweets: "234K" },
  { topic: "#AI", tweets: "567K" },
  { topic: "#TechNews", tweets: "98K" },
];

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const { data: users, isLoading } = useSearchUsers(query);
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-1">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            placeholder="Search users"
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#657786"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          {query.trim() ? (
            <>
              {isLoading ? (
                <ActivityIndicator size="large" color="#1DA1F2" />
              ) : users && users.length > 0 ? (
                users.map((user: any) => (
                  <TouchableOpacity
                    key={user._id}
                    className="flex-row items-center py-3 border-b border-gray-100"
                    onPress={() =>
                      router.push({
                        pathname: "/screens/profile/[username]",
                        params: { username: user.username },
                      })
                    }
                  >
                    <Image
                      source={{ uri: user.profilePicture || DEFAULT_AVATAR }}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    <View>
                      <Text className="font-bold text-gray-900 text-lg">
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        @{user.username}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-gray-500">No users found</Text>
              )}
            </>
          ) : (
            <>
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Trending for you
              </Text>
              {TRENDING_TOPICS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="py-3 border-b border-gray-100"
                >
                  <Text className="text-gray-500 text-sm">
                    Trending in Technology
                  </Text>
                  <Text className="font-bold text-gray-900 text-lg">
                    {item.topic}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {item.tweets} Tweets
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;
