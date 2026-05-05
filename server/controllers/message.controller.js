// import Message from "../models/Message.model.js";
// import User from "../models/User.model.js";
// import cloudinary from "../lib/cloudinary.js";
// import { io, getReceiverSocketId } from "../socket/socket.js";

// // ─── GET conversation between two users ──────────────────
// export const getMessages = async (req, res) => {
//   try {
//     const { id: receiverId } = req.params;
//     const senderId = req.user._id;

//     // Fetch all messages between the two users in both directions
//     const messages = await Message.find({
//       $or: [
//         { senderId, receiverId },
//         { senderId: receiverId, receiverId: senderId },
//       ],
//     }).sort({ createdAt: 1 }); // oldest first

//     // Mark all received messages as seen
//     await Message.updateMany(
//       {
//         senderId: receiverId,
//         receiverId: senderId,
//         seen: false,
//       },
//       { seen: true }
//     );

//     res.status(200).json(messages);
//   } catch (error) {
//     console.error("getMessages error:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // ─── SEND a message ───────────────────────────────────────
// export const sendMessage = async (req, res) => {
//   try {
//     const { text, image } = req.body;
//     const { id: receiverId } = req.params;
//     const senderId = req.user._id;

//     // Validate — must have text or image
//     if (!text && !image) {
//       return res
//         .status(400)
//         .json({ message: "Message must have text or image" });
//     }

//     // Check receiver exists
//     const receiver = await User.findById(receiverId);
//     if (!receiver) {
//       return res.status(404).json({ message: "Receiver not found" });
//     }

//     let imageUrl = "";

//     // If image included, upload to Cloudinary
//     if (image) {
//       const uploadResponse = await cloudinary.uploader.upload(image, {
//         folder: "chatify/messages",
//         resource_type: "image",
//         transformation: [{ width: 800, crop: "limit" }], // max 800px wide
//       });
//       imageUrl = uploadResponse.secure_url;
//     }

//     // Save message to MongoDB
//     const newMessage = new Message({
//       senderId,
//       receiverId,
//       text: text || "",
//       image: imageUrl,
//     });

//     await newMessage.save();

//     // ── Real-time delivery via Socket.io ──────────────────
//     // If receiver is online, emit to their socket directly
//     const receiverSocketId = getReceiverSocketId(receiverId);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("newMessage", newMessage);
//     }

//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.error("sendMessage error:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // ─── DELETE a message ─────────────────────────────────────
// export const deleteMessage = async (req, res) => {
//   try {
//     const { id: messageId } = req.params;
//     const userId = req.user._id;

//     const message = await Message.findById(messageId);

//     if (!message) {
//       return res.status(404).json({ message: "Message not found" });
//     }

//     // Only sender can delete their own message
//     if (message.senderId.toString() !== userId.toString()) {
//       return res
//         .status(403)
//         .json({ message: "You can only delete your own messages" });
//     }

//     // If message had an image, delete from Cloudinary too
//     if (message.image) {
//       const publicId = message.image.split("/").slice(-2).join("/").split(".")[0];
//       await cloudinary.uploader.destroy(publicId);
//     }

//     await Message.findByIdAndDelete(messageId);

//     res.status(200).json({ message: "Message deleted" });
//   } catch (error) {
//     console.error("deleteMessage error:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


import Message from "../models/Message.model.js";
import User from "../models/User.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

// ─── GET conversation between two users ──────────────────
export const getMessages = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      {
        senderId: receiverId,
        receiverId: senderId,
        seen: false,
      },
      { seen: true }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── SEND a message ───────────────────────────────────────
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res
        .status(400)
        .json({ message: "Message must have text or image" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let imageUrl = "";

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chatify/messages",
        resource_type: "image",
        transformation: [{ width: 800, crop: "limit" }],
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── DELETE a message ─────────────────────────────────────
export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own messages" });
    }

    if (message.image) {
      const publicId = message.image
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];

      await cloudinary.uploader.destroy(publicId);
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.error("deleteMessage error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── REACT to a message ───────────────────────────────────
export const reactToMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { reaction } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Simple reaction (you can upgrade later)
    message.reaction = {
      userId,
      reaction,
    };

    await message.save();

    // Emit reaction update
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReaction", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("reactToMessage error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};