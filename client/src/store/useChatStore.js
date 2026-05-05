import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { getSocket } from "../lib/socket.js";
import { useThemeStore } from "./useThemeStore.js";
import { playMessageSound } from "../lib/sounds.js";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  onlineUsers: [],
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,
  replyingTo: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyingTo } = get();
    try {
      const payload = { ...messageData };
      if (replyingTo) {
        payload.replyTo = {
          messageId: replyingTo._id,
          text: replyingTo.text || "📷 Image",
          senderUsername: replyingTo.senderUsername || "User",
        };
      }
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
      set({ messages: [...messages, res.data], replyingTo: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }));
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  reactToMessage: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.post(`/messages/react/${messageId}`, { emoji });
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId ? { ...m, reactions: res.data.reactions } : m
        ),
      }));
    } catch {
      toast.error("Failed to react");
    }
  },

  setSelectedUser: (user) => {
    set((state) => ({
      selectedUser: user,
      messages: [],
      isTyping: false,
      replyingTo: null,
      users: state.users.map((u) =>
        u._id === user?._id ? { ...u, unreadCount: 0 } : u
      ),
    }));
    if (user) get().getMessages(user._id);
  },

  setReplyingTo: (message) => set({ replyingTo: message }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = getSocket();
    if (!socket) return;

    socket.on("newMessage", (message) => {
      const { soundEnabled } = useThemeStore.getState();
      if (message.senderId === selectedUser._id) {
        set((state) => ({ messages: [...state.messages, message] }));
        if (soundEnabled) playMessageSound();
      } else {
        set((state) => ({
          users: state.users.map((u) =>
            u._id === message.senderId
              ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
              : u
          ),
        }));
        if (soundEnabled) playMessageSound();
      }
    });

    socket.on("getOnlineUsers", (userIds) => set({ onlineUsers: userIds }));

    socket.on("messageReaction", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId ? { ...m, reactions } : m
        ),
      }));
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId === selectedUser._id) set({ isTyping: true });
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === selectedUser._id) set({ isTyping: false });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = getSocket();
    if (!socket) return;
    socket.off("newMessage");
    socket.off("getOnlineUsers");
    socket.off("messageReaction");
    socket.off("typing");
    socket.off("stopTyping");
  },
}));