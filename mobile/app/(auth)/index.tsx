import { useSocialAuth } from "@/hooks/useSocialAuth";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useEffect, useRef } from "react";
import {
  MaterialCommunityIcons,
  Feather,
  FontAwesome,
} from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const openTelegram = () => {
  Linking.openURL("https://t.me/Eyobex1");
};

export default function Index() {
  const { handleSocialAuth, isLoading } = useSocialAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  // Subtitle animation - single animation to prevent overlap
  const subtitleAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Text animation - appears inside the icon
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(textScaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    // Start subtitle animation after a short delay
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          // Scroll from right to left
          Animated.timing(subtitleAnim, {
            toValue: -200, // Adjusted for shorter text
            duration: 8000, // Faster for shorter text
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          // Reset position
          Animated.timing(subtitleAnim, {
            toValue: width,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1000);
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-5deg", "5deg"],
  });

  return (
    <View className="flex-1 bg-black">
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Background gradient */}
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb", "#f5576c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      {/* Animated floating particles */}
      <View className="absolute inset-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <Animated.View
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              top: `${20 * i}%`,
              left: `${15 * i}%`,
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }}
          />
        ))}
      </View>

      <Animated.View
        className="flex-1 px-6 justify-between"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        {/* Header Section */}
        <View className="pt-16 items-center">
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            {/* REMOVED: Square gradient container */}
            <View className="w-32 h-32 rounded-3xl items-center justify-center mb-6">
              {/* Initial icon */}
              <Feather name="search" size={120} color="white" />

              {/* Animated text inside the icon */}
              <Animated.View
                style={{
                  position: "absolute",
                  opacity: textFadeAnim,
                  transform: [{ scale: textScaleAnim }],
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 28,
                    fontWeight: "bold",
                    fontFamily: "System", // Add custom Amharic font if available
                    textShadowColor: "rgba(0, 0, 0, 0.5)",
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 3,
                  }}
                >
                  ኣለሻ
                </Text>
              </Animated.View>
            </View>
          </Animated.View>

          {/* App name removed since it's now inside the icon */}

          <View className="w-full h-10 overflow-hidden mb-8 rounded-lg">
            <Animated.View
              style={{
                transform: [{ translateX: subtitleAnim }],
                flexDirection: "row",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Text className="text-white/80 text-lg font-medium whitespace-nowrap">
                ኣለሻ የጠፉ እቃዎችን ለመፈለግና የተገኙትን ለባለቤታቸው ለመመለስ የሚያግዝ መተግበሪያ ነው።
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* Developer Info Card */}
        <Animated.View
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 mb-8 border border-white/20"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <TouchableOpacity
            onPress={openTelegram}
            activeOpacity={0.7}
            className="flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center mr-3">
                <MaterialCommunityIcons
                  name="rocket-launch"
                  size={24}
                  color="white"
                />
              </View>
              <View>
                <Text className="text-white font-semibold text-lg">
                  Eyob Tekle
                </Text>
                <Text className="text-white/70 text-sm">Software Engineer</Text>
              </View>
            </View>
            <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-full">
              <Feather name="send" size={16} color="white" />
              <Text className="text-white ml-2 font-medium">Contact</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Auth Buttons Section */}
        <View className="pb-12">
          <View className="flex-col gap-4">
            {/* Google Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-white rounded-2xl py-5"
              onPress={() => handleSocialAuth("oauth_google")}
              disabled={isLoading}
              activeOpacity={0.8}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center">
                    <Image
                      source={require("../../assets/images/google.png")}
                      className="w-14 h-14"
                      resizeMode="contain"
                    />
                  </View>
                  <Text className="text-gray-800 font-bold text-lg ml-4">
                    Continue with Google
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Apple Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-black rounded-2xl py-5"
              onPress={() => handleSocialAuth("oauth_apple")}
              disabled={isLoading}
              activeOpacity={0.8}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
                borderWidth: 1,
                borderColor: "#333",
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-gray-900 items-center justify-center">
                    <FontAwesome name="apple" size={32} color="white" />
                  </View>
                  <Text className="text-white font-bold text-lg ml-4">
                    Continue with Apple
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Terms and Privacy */}
            <Text className="text-center text-white/60 text-xs leading-5 mt-8 px-4">
              By signing up, you agree to our{" "}
              <Text className="text-white font-semibold">Terms</Text>
              {", "}
              <Text className="text-white font-semibold">Privacy Policy</Text>
              {", and "}
              <Text className="text-white font-semibold">Cookie Use</Text>
              {"."}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Bottom Wave Decoration */}
      <View className="absolute bottom-0 left-0 right-0">
        <View className="w-full h-4 bg-white/10" />
        <View className="w-full h-4 bg-white/5" />
        <View className="w-full h-4 bg-white/2" />
      </View>
    </View>
  );
}
