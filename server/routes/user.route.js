import express from "express";
import { getUsersForSidebar } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { generalLimiter, createArcjetMiddleware } from "../middleware/arcjet.middleware.js";

const router = express.Router();
const arcjetGeneral = createArcjetMiddleware(generalLimiter);

router.get("/", protectRoute, arcjetGeneral, getUsersForSidebar);

export default router;