import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

/*
======================================================
  🔐 PROTECT ROUTE (ACCESS TOKEN BASED)
======================================================

❌ OLD:
- Read token from cookies
- Used JWT_SECRET
- Long-lived JWT

✅ NEW:
- Read access token from Authorization header
- Uses ACCESS_TOKEN_SECRET
- Short-lived access token
*/

export const protectRoute = async (req, res, next) => {
  try {
    // ============================
    // 🔄 CHANGED: Read token from HEADER, not cookie
    // Expected format:
    // Authorization: Bearer <accessToken>
    // ============================
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    // ============================
    // 🔄 CHANGED: Verify using ACCESS_TOKEN_SECRET
    // ============================
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    let user;

    // ============================
    // ✅ SAME LOGIC: Fetch user based on role
    // ============================
    if (decoded.role === "student") {
      user = await User.findById(decoded.userId).select("-password");
    }

    if (decoded.role === "admin") {
      user = await Admin.findById(decoded.userId).select("-password");
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid user",
      });
    }

    // ============================
    // 🔄 CHANGED: user info comes from ACCESS TOKEN
    // ============================
    req.user = user;
    req.role = decoded.role;

    next(); // ✅ Access granted
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized or token expired",
    });
  }
};
