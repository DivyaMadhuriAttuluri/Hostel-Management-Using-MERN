import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getMessMenu,
  upsertMessMenu,
  deleteMessMenu,
} from "../controllers/messMenu.js";

const router = express.Router();

// Get menu (authenticated users)
router.get("/", protectRoute, getMessMenu);

// Admin: create/update menu
router.post("/", protectRoute, upsertMessMenu);

// Admin: delete menu entry
router.delete("/:id", protectRoute, deleteMessMenu);

export default router;
