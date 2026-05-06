import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { getSocket } from "../lib/socket.js";
import { useThemeStore } from "./useThemeStore.js";
import { playMessageSound } from "../lib/sounds.js";
import toast from "react-hot-toast";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error("Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (name, description, memberIds) => {
    try {
      const res = await axiosInstance.post("/groups", { name, description, memberIds });
      set((state) => ({ groups: [res.data, ...state.groups] }));
      toast.success("Group created!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      return null;
    }
  },

  setSelectedGroup: (group) => {
    set({ selectedGroup: group, groupMessages: [] });
    if (group) get().getGroupMessages(group._id);
  },

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error("Failed to load group messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/messages`, messageData);
      set((state) => ({ groupMessages: [...state.groupMessages, res.data] }));
    } catch (error) {
      toast.error("Failed to send message");
    }
  },

  subscribeToGroupMessages: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("newGroupMessage", ({ groupId, message }) => {
      const { selectedGroup } = get();
      if (selectedGroup?._id === groupId) {
        set((state) => ({ groupMessages: [...state.groupMessages, message] }));
        const { soundEnabled } = useThemeStore.getState();
        if (soundEnabled) playMessageSound();
      }
    });

    socket.on("newGroup", (group) => {
      set((state) => ({ groups: [group, ...state.groups] }));
      toast.success(`You were added to "${group.name}"`);
    });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = getSocket();
    if (!socket) return;
    socket.off("newGroupMessage");
    socket.off("newGroup");
  },
}));