import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/User.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId?.toString()];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    User.findByIdAndUpdate(userId, { isOnline: true }).catch(() => {});
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ receiverId }) => {
    const socketId = getReceiverSocketId(receiverId);
    if (socketId) io.to(socketId).emit("typing", { senderId: userId });
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const socketId = getReceiverSocketId(receiverId);
    if (socketId) io.to(socketId).emit("stopTyping", { senderId: userId });
  });

  socket.on("joinGroup", (groupId) => {
    socket.join(`group_${groupId}`);
  });

  socket.on("leaveGroup", (groupId) => {
    socket.leave(`group_${groupId}`);
  });

  socket.on("disconnect", async () => {
    if (userId && userId !== "undefined") {
      delete userSocketMap[userId];
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error("lastSeen update:", err.message);
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };