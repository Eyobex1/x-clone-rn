import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      ref: "User",
      required: true,
    },
    to: {
      type: String,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["follow", "like", "comment"],
    },

    // ⭐ NEW: mark notification unread/read
    isRead: {
      type: Boolean,
      default: false, // default = UNREAD like Facebook
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
