import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,
    },
    text: { type: String, default: "" },
    image: { type: String, default: "" },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reactions: [
      {
        emoji: { type: String },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);
export default GroupMessage;