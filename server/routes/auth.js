import express from "express";
import passport from "passport";
import {
  registerStudent,
  loginStudent,
  loginAdmin,
  logoutUser,
  getMe,
  refreshToken,      // 🔹 NEW
} from "../controllers/auth.js";

import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// =======================
// AUTH ROUTES
// =======================

// student registration request
router.post("/register", registerStudent);

// student login
router.post("/login", loginStudent);

// admin login
router.post("/admin/login", loginAdmin);

// 🔄 NEW: refresh access token (NO protectRoute here)
router.post("/refresh", refreshToken);

// logout (clears refresh token)
router.post("/logout", logoutUser);

// get current logged-in user
router.get("/me", protectRoute, getMe);

// 🔐 GOOGLE OAUTH LOGIN
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// 🔐 GOOGLE OAUTH CALLBACK
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/oauth-failed",
  }),
  async (req, res) => {
    const { generateAccessToken, generateRefreshToken } = await import(
      "../lib/token.js"
    );
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
      7 * 24 * 60 * 60
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // 🚀 Redirect back to frontend with access token
    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${accessToken}`
    );
  }
);

router.get("/oauth-failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Google login failed. Account not found or not approved.",
  });
});



export default router;
