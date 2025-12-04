import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  deleteNotification,
  getUnreadCount,
  markAllRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Existing routes
router.get("/", protectRoute, getNotifications);
router.delete("/:notificationId", protectRoute, deleteNotification);

// ⭐ NEW: get unread count
router.get("/unread-count", protectRoute, getUnreadCount);

// ⭐ NEW: mark all notifications as read
router.put("/mark-read", protectRoute, markAllRead);

export default router;
