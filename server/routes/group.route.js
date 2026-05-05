import express from "express";
import {
  createGroup, getMyGroups, getGroupMessages,
  sendGroupMessage, addMember, removeMember,
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getMyGroups);
router.get("/:id/messages", protectRoute, getGroupMessages);
router.post("/:id/messages", protectRoute, sendGroupMessage);
router.post("/:id/members/add", protectRoute, addMember);
router.post("/:id/members/remove", protectRoute, removeMember);

export default router;