// app/[...notfound].tsx
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function NotFound() {
  const router = useRouter();
  return (
    <View className="flex-1 justify-center items-center bg-gray-50 p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-2">
        Page Not Found 😅
      </Text>
      <Text className="text-gray-600 mb-4">
        The page you are looking for does not exist.
      </Text>
      <Button title="Go Home" onPress={() => router.push("/")} />
    </View>
  );
}
