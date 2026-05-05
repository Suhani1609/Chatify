import express from "express";
import {
  signup, login, logout, checkAuth,
  updateProfile, forgotPassword, resetPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { authLimiter, createArcjetMiddleware } from "../middleware/arcjet.middleware.js";

const router = express.Router();
const arcjetAuth = createArcjetMiddleware(authLimiter);

router.post("/signup", arcjetAuth, signup);
router.post("/login", arcjetAuth, login);
router.post("/logout", protectRoute, logout);
router.get("/check", protectRoute, checkAuth);
router.put("/update-profile", protectRoute, updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;