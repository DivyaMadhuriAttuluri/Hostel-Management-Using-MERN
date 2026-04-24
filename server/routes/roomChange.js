import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  createRoomChangeRequest,
  getMyRoomChangeRequests,
  getBlockRoomChangeRequests,
  updateRoomChangeStatus,
} from "../controllers/roomChange.js";

const router = express.Router();

// Student: create request
router.post("/", protectRoute, createRoomChangeRequest);

// Student: get my requests
router.get("/my", protectRoute, getMyRoomChangeRequests);

// Admin: get block requests
router.get("/admin", protectRoute, getBlockRoomChangeRequests);

// Admin: approve/reject
router.patch("/:id", protectRoute, updateRoomChangeStatus);

export default router;
