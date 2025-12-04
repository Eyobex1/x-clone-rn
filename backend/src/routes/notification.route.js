import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  deleteNotification,
  getUnreadCount,
  markAllRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

// ⭐ Infinite scroll notifications
router.get("/", protectRoute, getNotifications);

// Delete a notification
router.delete("/:notificationId", protectRoute, deleteNotification);

// Get unread notification count (for tab badge)
router.get("/unread-count", protectRoute, getUnreadCount);

// Mark all notifications as read
router.put("/mark-read", protectRoute, markAllRead);

export default router;
