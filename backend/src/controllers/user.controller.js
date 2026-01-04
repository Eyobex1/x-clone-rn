import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import cloudinary from "../config/cloudinary.js";
import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/express";

// Get user profile by username
export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user });
});

// Update current user's profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  let updateData = req.body;

  // Upload profile picture
  if (req.files?.profilePicture?.[0]) {
    const file = req.files.profilePicture[0];
    const base64Img = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;
    const uploaded = await cloudinary.uploader.upload(base64Img, {
      folder: "profile_pictures",
    });
    updateData.profilePicture = uploaded.secure_url;
  }

  // Upload banner image
  if (req.files?.bannerImage?.[0]) {
    const file = req.files.bannerImage[0];
    const base64Img = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;
    const uploaded = await cloudinary.uploader.upload(base64Img, {
      folder: "banner_images",
    });
    updateData.bannerImage = uploaded.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
    new: true,
  });

  res.status(200).json({ user: updatedUser });
});

// Sync user from Clerk
export const syncUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);

  const existingUser = await User.findOne({ clerkId: userId });
  if (existingUser)
    return res
      .status(200)
      .json({ user: existingUser, message: "User already exists" });

  const clerkUser = await clerkClient.users.getUser(userId);
  const userData = {
    clerkId: userId,
    email: clerkUser.emailAddresses[0].emailAddress,
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
    username: clerkUser.emailAddresses[0].emailAddress.split("@")[0],
    profilePicture: clerkUser.imageUrl || "",
    followers: [],
    following: [],
  };

  const user = await User.create(userData);
  res.status(201).json({ user, message: "User created successfully" });
});

// Get current logged-in user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.status(200).json({ user });
});

// Follow / unfollow user
export const followUser = asyncHandler(async (req, res) => {
  const { userId: currentUserId } = getAuth(req);
  const { targetUserId } = req.params;

  if (currentUserId === targetUserId)
    return res.status(400).json({ error: "You cannot follow yourself" });

  const currentUser = await User.findOne({ clerkId: currentUserId });
  const targetUser = await User.findOne({ clerkId: targetUserId });

  if (!currentUser || !targetUser)
    return res.status(404).json({ error: "User not found" });

  const isFollowing = currentUser.following.includes(targetUserId);

  if (isFollowing) {
    // Unfollow
    await User.findOneAndUpdate(
      { clerkId: currentUserId },
      { $pull: { following: targetUserId } }
    );
    await User.findOneAndUpdate(
      { clerkId: targetUserId },
      { $pull: { followers: currentUserId } }
    );
  } else {
    // Follow
    await User.findOneAndUpdate(
      { clerkId: currentUserId },
      { $addToSet: { following: targetUserId } }
    );
    await User.findOneAndUpdate(
      { clerkId: targetUserId },
      { $addToSet: { followers: currentUserId } }
    );

    await Notification.create({
      from: currentUserId,
      to: targetUserId,
      type: "follow",
    });
  }

  res.status(200).json({
    message: isFollowing
      ? "User unfollowed successfully"
      : "User followed successfully",
  });
});

// In user.controller.js - Update both getFollowers and getFollowing functions

// Get followers list - UPDATED
export const getFollowers = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  const followers = await User.find({
    clerkId: { $in: user.followers || [] },
  }).select(
    "_id firstName lastName username profilePicture followers following"
  );

  res.status(200).json({ users: followers });
});

// Get following list - UPDATED
export const getFollowing = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  const following = await User.find({
    clerkId: { $in: user.following || [] },
  }).select(
    "_id firstName lastName username profilePicture followers following"
  );

  res.status(200).json({ users: following });
});
