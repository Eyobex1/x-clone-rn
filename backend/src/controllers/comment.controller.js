import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

/* ============================================================
   GET ALL COMMENTS FOR A POST (Newest First + Pagination)
   ============================================================ */
export const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const skip = (page - 1) * limit;

  // Total number of comments for pagination
  const totalComments = await Comment.countDocuments({ post: postId });

  // Fetch paginated comments sorted by newest first
  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 }) // Newest comments first
    .skip(skip)
    .limit(limit)
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "replies",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });

  res.status(200).json({
    comments,
    page,
    totalPages: Math.ceil(totalComments / limit),
    hasMore: page * limit < totalComments,
  });
});

/* ============================================================
   CREATE COMMENT (top-level, not a reply)
   ============================================================ */
export const createComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;
  const { content, image } = req.body;

  // Validate input
  if (!content && !image) {
    return res
      .status(400)
      .json({ error: "Comment must contain text or image" });
  }

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post)
    return res.status(404).json({ error: "User or post not found" });

  // Create new comment
  const comment = await Comment.create({
    user: user._id,
    post: postId,
    content,
    image: image || null,
  });

  // Attach comment to post
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment._id },
  });

  // Send notification to post owner (except self)
  if (post.user.toString() !== user._id.toString()) {
    await Notification.create({
      from: user._id,
      to: post.user,
      type: "comment",
      post: postId,
      comment: comment._id,
    });
  }

  res.status(201).json({ comment });
});

/* ============================================================
   DELETE COMMENT (only owner can delete)
   ============================================================ */
export const deleteComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { commentId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const comment = await Comment.findById(commentId);

  if (!user || !comment) {
    return res.status(404).json({ error: "User or comment not found" });
  }

  // enforce ownership
  if (comment.user.toString() !== user._id.toString()) {
    return res
      .status(403)
      .json({ error: "You can only delete your own comments" });
  }

  // remove comment from its post
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: commentId },
  });

  // delete comment from database
  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({ message: "Comment deleted successfully" });
});

/* ============================================================
   LIKE / UNLIKE COMMENT (Facebook style toggle)
   ============================================================ */
export const likeComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { commentId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(404).json({ error: "Comment not found" });
  }

  const hasLiked = comment.likes.includes(user._id);

  if (hasLiked) {
    comment.likes.pull(user._id); // unlike
  } else {
    comment.likes.push(user._id); // like
  }

  await comment.save();

  res.status(200).json({
    likes: comment.likes,
    liked: !hasLiked,
  });
});

/* ============================================================
   REPLY TO A COMMENT (Facebook nested replies)
   ============================================================ */
export const replyToComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { commentId } = req.params;
  const { content, image } = req.body;

  // Validate input
  if (!content && !image) {
    return res.status(400).json({
      error: "Reply must contain text or image",
    });
  }

  const user = await User.findOne({ clerkId: userId });
  const parentComment = await Comment.findById(commentId);

  if (!parentComment) {
    return res.status(404).json({ error: "Parent comment not found" });
  }

  // Create reply comment
  const reply = await Comment.create({
    user: user._id,
    post: parentComment.post,
    content,
    image: image || null,
  });

  // Attach reply to parent comment
  parentComment.replies.push(reply._id);
  await parentComment.save();

  res.status(201).json({ reply });
});
