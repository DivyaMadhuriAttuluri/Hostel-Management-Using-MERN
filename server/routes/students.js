import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorize.js";

import {
  getStudentProfile,
  updateStudentProfile,
  changeStudentPassword,
  getDashboardStats,
} from "../controllers/students.js";

const router = express.Router();

// Dashboard stats
router.get(
  "/dashboard/stats",
  protectRoute,
  authorizeRoles("student"),
  getDashboardStats
);

// Get profile
router.get(
  "/profile",
  protectRoute,
  authorizeRoles("student"),
  getStudentProfile
);

// Update profile
router.put(
  "/profile",
  protectRoute,
  authorizeRoles("student"),
  updateStudentProfile
);

// Change password
router.put(
  "/change-password",
  protectRoute,
  authorizeRoles("student"),
  changeStudentPassword
);

export default router;
