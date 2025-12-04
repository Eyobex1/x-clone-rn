import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// ================================
// GET Notifications with Infinite Scroll
// ================================
export const getNotifications = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  // ⭐ Infinite scroll: use query params for pagination
  const { page = 1, limit = 10 } = req.query; // default 10 notifications per page
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const notifications = await Notification.find({ to: user._id })
    .sort({ createdAt: -1 })
    .skip(skip) // ⭐ skip for pagination
    .limit(parseInt(limit)) // ⭐ limit per page
    .populate("from", "username firstName lastName profilePicture")
    .populate("post", "content image")
    .populate("comment", "content");

  // ⭐ total count to help frontend know if more pages exist
  const total = await Notification.countDocuments({ to: user._id });

  res.status(200).json({
    notifications,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)), // ⭐ calculate total pages
    total,
  });
});

// ================================
// DELETE Notification (EXISTING)
// ================================
export const deleteNotification = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { notificationId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    to: user._id,
  });

  if (!notification)
    return res.status(404).json({ error: "Notification not found" });

  res.status(200).json({ message: "Notification deleted successfully" });
});

// ================================
// GET UNREAD COUNT
// ================================
export const getUnreadCount = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });

  if (!user) return res.status(404).json({ error: "User not found" });

  const count = await Notification.countDocuments({
    to: user._id,
    isRead: false,
  });

  res.json({ count });
});

// ================================
// MARK ALL AS READ
// ================================
export const markAllRead = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });

  if (!user) return res.status(404).json({ error: "User not found" });

  await Notification.updateMany({ to: user._id }, { $set: { isRead: true } });

  res.json({ message: "All notifications marked as read" });
});
