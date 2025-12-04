import { Redirect, Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

// ⭐ ADDED: unread notifications hook
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();

  // ⭐ NEW: unread count
  const { unreadCount } = useUnreadNotifications();

  if (!isSignedIn) return <Redirect href="/(auth)" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1DA1F2",
        tabBarInactiveTintColor: "#657786",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#E1E8ED",
          height: 50 + insets.bottom,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
      />

      {/** ⭐ UPDATED NOTIFICATION TAB WITH BADGE ⭐ */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Feather name="bell" size={size} color={color} />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    backgroundColor: "red",
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 11,
                      fontWeight: "bold",
                    }}
                  >
                    {unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <Feather name="mail" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
