import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useApiClient } from "../utils/api";

export const useCreatePost = () => {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const api = useApiClient();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      content: string;
      imageUri?: string;
      width?: number;
      height?: number;
    }) => {
      const formData = new FormData();

      if (postData.content) formData.append("content", postData.content);

      if (postData.imageUri) {
        const uriParts = postData.imageUri.split(".");
        const fileType = uriParts[uriParts.length - 1].toLowerCase();

        formData.append("image", {
          uri: postData.imageUri,
          name: `image.${fileType}`,
          type: "image/jpeg",
        } as any);

        if (postData.width)
          formData.append("imageWidth", postData.width.toString());
        if (postData.height)
          formData.append("imageHeight", postData.height.toString());
      }

      return api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      setContent("");
      setSelectedImage(null);
      setImageDimensions(null);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      Alert.alert("Success", "Post created successfully!");
    },
    onError: () => {
      Alert.alert("Error", "Failed to create post. Please try again.");
    },
  });

  const pickImage = async (useCamera: boolean = false) => {
    const permissionResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.status !== "granted") {
      Alert.alert(
        "Permission needed",
        `Please allow access to your ${useCamera ? "camera" : "photo library"}`
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          quality: 0.8,
        });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);

      // Get image dimensions
      Image.getSize(
        uri,
        (width, height) => setImageDimensions({ width, height }),
        () => setImageDimensions({ width: 1, height: 1 })
      );
    }
  };

  const createPost = () => {
    if (!content.trim() && !selectedImage) {
      Alert.alert(
        "Empty Post",
        "Please write something or add an image before posting!"
      );
      return;
    }

    createPostMutation.mutate({
      content: content.trim(),
      imageUri: selectedImage || undefined,
      width: imageDimensions?.width,
      height: imageDimensions?.height,
    });
  };

  return {
    content,
    setContent,
    selectedImage,
    imageDimensions,
    isCreating: createPostMutation.isPending,
    pickImageFromGallery: () => pickImage(false),
    takePhoto: () => pickImage(true),
    removeImage: () => {
      setSelectedImage(null);
      setImageDimensions(null);
    },
    createPost,
  };
};
