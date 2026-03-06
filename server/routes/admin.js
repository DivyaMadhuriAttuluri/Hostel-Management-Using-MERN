import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorize.js";

import {
  getAllStudentDetails,
  getStudentDetails,
  approveStudent,
  rejectStudent,
  getPendingRegistrations,
  getDashboardStats,
  deleteStudent,
} from "../controllers/admin.js";

const router = express.Router();

// Dashboard stats
router.get(
  "/dashboard/stats",
  protectRoute,
  authorizeRoles("admin"),
  getDashboardStats
);

// Get all students
router.get(
  "/students",
  protectRoute,
  authorizeRoles("admin"),
  getAllStudentDetails
);

// Get single student details
router.get(
  "/students/:studentID",
  protectRoute,
  authorizeRoles("admin"),
  getStudentDetails
);

// Get pending registration requests
router.get(
  "/registrations",
  protectRoute,
  authorizeRoles("admin"),
  getPendingRegistrations
);

// Approve student
router.patch(
  "/students/:requestId/approve",
  protectRoute,
  authorizeRoles("admin"),
  approveStudent
);

// Reject student
router.patch(
  "/students/:requestId/reject",
  protectRoute,
  authorizeRoles("admin"),
  rejectStudent
);

// Delete student
router.delete(
  "/students/:studentId",
  protectRoute,
  authorizeRoles("admin"),
  deleteStudent
);

export default router;
