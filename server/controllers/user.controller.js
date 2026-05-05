import User from "../models/User.model.js";
import Message from "../models/Message.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    const usersWithUnread = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          seen: false,
        });
        return { ...user.toObject(), unreadCount };
      })
    );

    usersWithUnread.sort((a, b) => b.unreadCount - a.unreadCount);

    res.status(200).json(usersWithUnread);
  } catch (error) {
    console.error("getUsersForSidebar error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};