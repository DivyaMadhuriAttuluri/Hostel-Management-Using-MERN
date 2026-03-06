import express from "express";
import {
  getMyNotifications,
  markAllRead,
  markOneRead,
} from "../controllers/notifications.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protectRoute, getMyNotifications);
router.patch("/read-all", protectRoute, markAllRead);
router.patch("/:id/read", protectRoute, markOneRead);

export default router;
