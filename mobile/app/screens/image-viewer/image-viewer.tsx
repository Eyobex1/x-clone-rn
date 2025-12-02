import { View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import Toast from "react-native-toast-message";

export default function ImageViewer() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  const downloadImage = async () => {
    try {
      setDownloading(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission needed",
          text2: "Allow access to save images",
        });
        return;
      }

      const fileUri = FileSystem.cacheDirectory + "image.jpg";
      const download = await FileSystem.downloadAsync(uri as string, fileUri);

      await MediaLibrary.saveToLibraryAsync(download.uri);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Image saved to gallery!",
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save image.",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      {/* Close */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ position: "absolute", top: 50, left: 20, zIndex: 20 }}
      >
        <Feather name="x" size={30} color="white" />
      </TouchableOpacity>

      {/* Download */}
      <TouchableOpacity
        onPress={downloadImage}
        style={{ position: "absolute", top: 50, right: 20, zIndex: 20 }}
        disabled={downloading}
      >
        {downloading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Feather name="download" size={30} color="white" />
        )}
      </TouchableOpacity>

      {/* Fullscreen Image */}
      <Image
        source={{ uri: uri as string }}
        style={{ width: "100%", height: "100%", resizeMode: "contain" }}
      />
    </View>
  );
}
