import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";

let socket = null;

export const connectSocket = (userId) => {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      query: { userId },
      withCredentials: true,
    });
    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("disconnect", () => console.log("❌ Socket disconnected"));
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket?.connected) { socket.disconnect(); socket = null; }
};

export const getSocket = () => socket;