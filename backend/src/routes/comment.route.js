import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createComment,
  getComments,
  deleteComment,
  likeComment,
  replyToComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

/* -----------------------------------------------
   PUBLIC ROUTES (NO AUTH REQUIRED)
------------------------------------------------*/

// Get all comments for a specific post
router.get("/post/:postId", getComments);

/* -----------------------------------------------
   PROTECTED ROUTES (REQUIRES LOGIN)
------------------------------------------------*/

// Create a new comment under a post
router.post("/post/:postId", protectRoute, createComment);

// Delete your own comment
router.delete("/:commentId", protectRoute, deleteComment);

// Like / Unlike a comment
router.post("/:commentId/like", protectRoute, likeComment);

// Reply to an existing comment
router.post("/:commentId/reply", protectRoute, replyToComment);

export default router;
