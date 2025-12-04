import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// ================================
// GET Notifications (EXISTING)
// ================================
export const getNotifications = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);

  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  const notifications = await Notification.find({ to: user._id })
    .sort({ createdAt: -1 })
    .populate("from", "username firstName lastName profilePicture")
    .populate("post", "content image")
    .populate("comment", "content");

  res.status(200).json({ notifications });
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
// ⭐ NEW: GET UNREAD COUNT
// ================================
export const getUnreadCount = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });

  if (!user) return res.status(404).json({ error: "User not found" });

  const count = await Notification.countDocuments({
    to: user._id,
    isRead: false, // Only unread notifications
  });

  res.json({ count });
});

// ================================
// ⭐ NEW: MARK ALL AS READ
// ================================
export const markAllRead = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });

  if (!user) return res.status(404).json({ error: "User not found" });

  await Notification.updateMany(
    { to: user._id },
    { $set: { isRead: true } } // Mark all as read
  );

  res.json({ message: "All notifications marked as read" });
});
