import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.model.js";
import cloudinary from "../lib/cloudinary.js";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../lib/resend.js";

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("chatify_jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return token;
};

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: "Username must be between 3 and 20 characters" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already in use" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username already taken" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    generateTokenAndSetCookie(newUser._id, res);
    sendWelcomeEmail(email, username);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      profilePic: newUser.profilePic,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid email or password" });

    user.isOnline = true;
    await user.save();

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      isOnline: user.isOnline,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        isOnline: false,
        lastSeen: new Date(),
      });
    }
    res.cookie("chatify_jwt", "", { maxAge: 0, httpOnly: true });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      profilePic: req.user.profilePic,
      isOnline: req.user.isOnline,
      lastSeen: req.user.lastSeen,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    console.error("CheckAuth error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, username } = req.body;
    const userId = req.user._id;
    const updates = {};

    if (username) {
      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ message: "Username must be 3–20 characters" });
      }
      const existing = await User.findOne({ username, _id: { $ne: userId } });
      if (existing) return res.status(400).json({ message: "Username already taken" });
      updates.username = username;
    }

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "chatify/avatars",
        transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
      });
      updates.profilePic = uploadResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("updateProfile error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: "If that email exists, a reset link has been sent" });

    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${token}`;

    await resend.emails.send({
      from: "Chatify <onboarding@resend.dev>",
      to: email,
      subject: "Reset your Chatify password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#00a884">Reset your password</h2>
          <p>Hi ${user.username},</p>
          <p>Click below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}"
            style="display:inline-block;margin:16px 0;padding:12px 24px;background:#00a884;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
            Reset Password
          </a>
          <p style="color:#666;font-size:13px">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ message: "If that email exists, a reset link has been sent" });
  } catch (error) {
    console.error("forgotPassword error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("resetPassword error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};