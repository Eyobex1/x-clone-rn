import { View, Image, TouchableOpacity, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

export default function ImageViewer() {
  const { uri } = useLocalSearchParams();
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  const downloadImage = async () => {
    try {
      setDownloading(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission required to save the image.");
        return;
      }

      const fileUri = FileSystem.cacheDirectory + "image.jpg";
      const download = await FileSystem.downloadAsync(uri as string, fileUri);

      await MediaLibrary.saveToLibraryAsync(download.uri);

      alert("Image saved to gallery!");
    } catch (e) {
      alert("Failed to save image.");
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
      >
        <Feather
          name={downloading ? "loader" : "download"}
          size={30}
          color="white"
        />
      </TouchableOpacity>

      {/* Fullscreen Image */}
      <Image
        source={{ uri: uri as string }}
        style={{
          width: "100%",
          height: "100%",
          resizeMode: "contain",
        }}
      />
    </View>
  );
}
