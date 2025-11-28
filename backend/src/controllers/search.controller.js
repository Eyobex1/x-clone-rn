import User from "../models/user.model.js";
import Post from "../models/post.model.js";

export const search = async (req, res) => {
  try {
    const query = req.query.query?.trim();

    if (!query) {
      return res.status(200).json({ users: [], posts: [] });
    }

    // SEARCH USERS (username, firstName, lastName)
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
    }).select("username firstName lastName profilePicture bio");

    // SEARCH POSTS (content)
    const posts = await Post.find({
      content: { $regex: query, $options: "i" },
    })
      .populate("user", "username firstName lastName profilePicture")
      .limit(30);

    return res.status(200).json({ users, posts });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    res.status(500).json({ error: "Failed to process search" });
  }
};
