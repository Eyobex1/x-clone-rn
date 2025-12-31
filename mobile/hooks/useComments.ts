import { useState } from "react";
import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, commentApi } from "../utils/api";
import { Comment } from "@/types";

export const useComments = () => {
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const api = useApiClient();
  const queryClient = useQueryClient();

  /* ================= CREATE / REPLY COMMENT ================= */
  const createCommentMutation = useMutation({
    mutationFn: async ({
      postId,
      commentId,
      content,
    }: {
      postId: string;
      commentId?: string;
      content: string;
    }) => {
      if (commentId) {
        const res = await commentApi.replyToComment(api, commentId, content);
        return res.data.reply as Comment;
      } else {
        const res = await commentApi.createComment(api, postId, content);
        return res.data.comment as Comment;
      }
    },
    onSuccess: () => {
      setCommentText("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to post comment. Please try again.");
    },
  });

  const createComment = (postId: string, commentId?: string) => {
    if (!commentText.trim()) {
      Alert.alert("Empty Comment", "Please write something first.");
      return;
    }

    createCommentMutation.mutate({
      postId,
      commentId,
      content: commentText.trim(),
    });
  };

  /* ================= LIKE COMMENT ================= */
  const toggleLikeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await commentApi.toggleLikeComment(api, commentId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to like comment.");
    },
  });

  /* ================= DELETE COMMENT ================= */
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await commentApi.deleteComment(api, commentId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete comment.");
    },
  });

  return {
    commentText,
    setCommentText,
    replyTo,
    setReplyTo,

    createComment,
    toggleLikeComment: toggleLikeCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,

    isCreatingComment: createCommentMutation.isPending,
  };
};
