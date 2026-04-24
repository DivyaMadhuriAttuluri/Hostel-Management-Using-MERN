import express from "express";
import passport from "passport";
import {
  authLimiter,
  sensitiveRouteLimiter,
} from "../middleware/rateLimiter.js";

// Core auth (register, login, logout, refresh, getMe)
import {
  registerStudent,
  getUnavailableRooms,
  loginStudent,
  loginAdmin,
  logoutUser,
  getMe,
  refreshToken,
} from "../controllers/auth.js";

// Password recovery (split for modularity)
import {
  forgotPassword,
  resetPassword,
  checkRegistrationStatus,
  sendChangePasswordOtp,
  verifyChangePasswordOtp,
} from "../controllers/passwordRecovery.js";

// Admin profile management (split for modularity)
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from "../controllers/adminProfile.js";

import { protectRoute } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorize.js";

const router = express.Router();

// =======================
// AUTH ROUTES
// =======================

// student registration request
router.post("/register", authLimiter, registerStudent);

// rooms unavailable for registration (allocated + pending)
router.get("/unavailable-rooms", authLimiter, getUnavailableRooms);

// student login
router.post("/login", authLimiter, loginStudent);

// admin login
router.post("/admin/login", authLimiter, loginAdmin);

// 🔄 refresh access token
router.post("/refresh", refreshToken);

// logout
router.post("/logout", logoutUser);

// get current logged-in user
router.get("/me", protectRoute, getMe);

// =======================
// PASSWORD RECOVERY (public)
// =======================
router.post("/forgot-password", sensitiveRouteLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/registration-status", authLimiter, checkRegistrationStatus);
router.post(
  "/change-password/send-otp",
  protectRoute,
  sensitiveRouteLimiter,
  sendChangePasswordOtp,
);
router.post(
  "/change-password/verify-otp",
  protectRoute,
  authLimiter,
  verifyChangePasswordOtp,
);

// =======================
// ADMIN PROFILE (protected)
// =======================
router.get(
  "/admin/profile",
  protectRoute,
  authorizeRoles("admin"),
  getAdminProfile,
);
router.put(
  "/admin/profile",
  protectRoute,
  authorizeRoles("admin"),
  updateAdminProfile,
);
router.put(
  "/admin/change-password",
  protectRoute,
  authorizeRoles("admin"),
  changeAdminPassword,
);

// =======================
// GOOGLE OAUTH
// =======================
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/oauth-failed",
  }),
  async (req, res) => {
    const { generateAccessToken, generateRefreshToken } =
      await import("../lib/token.js");
    const redis = (await import("../lib/redis.js")).default;

    const accessToken = generateAccessToken({
      _id: req.user.id,
      role: req.user.role,
    });

    const refreshToken = generateRefreshToken({
      _id: req.user.id,
    });

    await redis.set(
      `refresh:${req.user.id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${accessToken}`,
    );
  },
);

router.get("/oauth-failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Google login failed. Account not found or not approved.",
  });
});

export default router;
