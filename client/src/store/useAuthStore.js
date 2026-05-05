import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { connectSocket, disconnectSocket } from "../lib/socket.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      connectSocket(res.data._id);
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      set({ authUser: res.data });
      connectSocket(res.data._id);
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", formData);
      set({ authUser: res.data });
      connectSocket(res.data._id);
      toast.success("Logged in successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      disconnectSocket();
      set({ authUser: null });
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  },
}));