import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Admin from "../models/Admin.js";
import StudentRegRequest from "../models/StudentRegRequest.js";

import redis from "../lib/redis.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../lib/token.js";

/* ======================================================
   STUDENT REGISTRATION REQUEST
   (NO TOKEN CHANGES HERE)
====================================================== */
export const registerStudent = async (req, res) => {
  try {
    const {
      fullName,
      studentID,
      branch,
      collegeEmail,
      hostelBlock,
      roomNO,
      password,
    } = req.body;

    if (
      !fullName ||
      !studentID ||
      !branch ||
      !collegeEmail ||
      !hostelBlock ||
      !roomNO ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingStudent = await User.findOne({
      $or: [{ studentID }, { collegeEmail }, { hostelBlock, roomNO }],
    });

    if (existingStudent) {
      return res.status(400).json({ message: "Student already registered" });
    }

    const existingRequest = await StudentRegRequest.findOne({
      studentID,
      status: "pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Registration request already pending" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await StudentRegRequest.create({
      fullName,
      studentID,
      branch,
      collegeEmail,
      hostelBlock,
      roomNO,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Registration request sent to hostel admin",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   STUDENT LOGIN
====================================================== */
export const loginStudent = async (req, res) => {
  try {
    const { studentID, password } = req.body;

    if (!studentID || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const student = await User.findOne({ studentID });
    if (!student) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!student.isApproved) {
      return res
        .status(403)
        .json({ message: "Registration not approved by hostel admin" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔑 NEW TOKEN LOGIC
    const accessToken = generateAccessToken({
      _id: student._id,
      role: "student",
    });

    const refreshToken = generateRefreshToken({
      _id: student._id,
    });

    // store refresh token in redis
    await redis.set(
      `refresh:${student._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: student._id,
        fullName: student.fullName,
        studentID: student.studentID,
        branch: student.branch,
        hostelBlock: student.hostelBlock,
        roomNO: student.roomNO,
        role: "student",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   ADMIN LOGIN
====================================================== */
export const loginAdmin = async (req, res) => {
  try {
    const { adminID, password } = req.body;

    if (!adminID || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const admin = await Admin.findOne({ adminID });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken({
      _id: admin._id,
      role: "admin",
    });

    const refreshToken = generateRefreshToken({
      _id: admin._id,
    });

    await redis.set(
      `refresh:${admin._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: admin._id,
        name: admin.name,
        adminID: admin.adminID,
        hostelBlock: admin.hostelBlock,
        role: "admin",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   LOGOUT
====================================================== */
export const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    const payload = jwt.decode(refreshToken);
    // generateRefreshToken signs with { userId: ... }, so decoded key is 'userId'
    if (payload?.userId) {
      await redis.del(`refresh:${payload.userId}`);
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

/* ======================================================
   GET CURRENT USER
====================================================== */
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

/* ======================================================
   REFRESH ACCESS TOKEN
   POST /api/auth/refresh
====================================================== */
export const refreshToken = async (req, res) => {
  try {
    // 1️⃣ Get refresh token from HttpOnly cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    // 2️⃣ Verify refresh token signature
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // 3️⃣ Check Redis to see if refresh token is still valid
    // generateRefreshToken signs with { userId: ... }, so decoded key is 'userId'
    const storedToken = await redis.get(`refresh:${decoded.userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // 4️⃣ Find user to determine role
    let user =
      (await User.findById(decoded.userId)) ||
      (await Admin.findById(decoded.userId));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 5️⃣ Issue new access token
    const newAccessToken = generateAccessToken({
      _id: user._id,
      role: user.adminID ? "admin" : "student",
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Refresh token expired or invalid",
    });
  }
};

