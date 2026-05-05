import express from "express";
import {
  getMessages, sendMessage, deleteMessage, reactToMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { messageLimiter, createArcjetMiddleware } from "../middleware/arcjet.middleware.js";

const router = express.Router();
const arcjetMessage = createArcjetMiddleware(messageLimiter);

router.get("/:id", protectRoute, arcjetMessage, getMessages);
router.post("/send/:id", protectRoute, arcjetMessage, sendMessage);
router.delete("/:id", protectRoute, arcjetMessage, deleteMessage);
router.post("/react/:id", protectRoute, arcjetMessage, reactToMessage);

export default router;