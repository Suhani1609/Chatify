import Group from "../models/Group.model.js";
import GroupMessage from "../models/GroupMessage.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const adminId = req.user._id;

    if (!name) return res.status(400).json({ message: "Group name is required" });

    // Prevent duplicate group creation within 5 seconds
    const recentDuplicate = await Group.findOne({
      admin: adminId,
      name: name.trim(),
      createdAt: { $gte: new Date(Date.now() - 5000) },
    });

    if (recentDuplicate) {
      return res.status(400).json({ message: "Group already being created" });
    }

    const members = [...new Set([adminId.toString(), ...(memberIds || [])])];

    const group = new Group({
      name: name.trim(),
      description: description || "",
      admin: adminId,
      members,
    });

    await group.save();
    await group.populate("members", "-password");
    await group.populate("admin", "-password");

    members.forEach((memberId) => {
      const socketId = getReceiverSocketId(memberId);
      if (socketId) io.to(socketId).emit("newGroup", group);
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("createGroup error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("members", "-password")
      .populate("admin", "-password")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("getMyGroups error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { id: groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.map((m) => m.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({ message: "Not a member" });
    }

    const messages = await GroupMessage.find({ groupId })
      .populate("senderId", "username profilePic")
      .sort({ createdAt: 1 });

    await GroupMessage.updateMany(
      { groupId, seenBy: { $ne: req.user._id } },
      { $addToSet: { seenBy: req.user._id } }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("getGroupMessages error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: groupId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Message must have text or image" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.map((m) => m.toString()).includes(senderId.toString())) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    let imageUrl = "";
    if (image) {
      const upload = await cloudinary.uploader.upload(image, {
        folder: "chatify/group-messages",
        transformation: [{ width: 800, crop: "limit" }],
      });
      imageUrl = upload.secure_url;
    }

    const newMessage = new GroupMessage({
      groupId, senderId,
      text: text || "", image: imageUrl,
      seenBy: [senderId],
    });

    await newMessage.save();
    await newMessage.populate("senderId", "username profilePic");

    group.members.forEach((memberId) => {
      if (memberId.toString() !== senderId.toString()) {
        const socketId = getReceiverSocketId(memberId);
        if (socketId) io.to(socketId).emit("newGroupMessage", { groupId, message: newMessage });
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendGroupMessage error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can add members" });
    }
    if (group.members.map((m) => m.toString()).includes(userId)) {
      return res.status(400).json({ message: "Already a member" });
    }

    group.members.push(userId);
    await group.save();
    await group.populate("members", "-password");

    res.status(200).json(group);
  } catch (error) {
    console.error("addMember error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }
    if (group.admin.toString() === userId) {
      return res.status(400).json({ message: "Cannot remove admin" });
    }

    group.members = group.members.filter((m) => m.toString() !== userId);
    await group.save();
    await group.populate("members", "-password");

    res.status(200).json(group);
  } catch (error) {
    console.error("removeMember error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};