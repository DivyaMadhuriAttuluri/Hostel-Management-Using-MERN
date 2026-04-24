import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Admin from "../models/Admin.js";
import StudentRegRequest from "../models/StudentRegRequest.js";

import redis from "../lib/redis.js";
import { generateAccessToken, generateRefreshToken } from "../lib/token.js";

const FLOOR_PREFIX_TO_DIGIT = {
  G: 0,
  F: 1,
  S: 2,
  T: 3,
};

const FLOOR_DIGIT_TO_PREFIX = {
  0: "G",
  1: "F",
  2: "S",
  3: "T",
};

const buildRoomVariants = (roomInput) => {
  const raw = String(roomInput || "")
    .trim()
    .toUpperCase();
  if (!raw) return [];

  const variants = new Set([raw]);

  const prefixedMatch = raw.match(/^([GFST])\s*-\s*(\d{1,3})$/);
  if (prefixedMatch) {
    const prefix = prefixedMatch[1];
    const roomNumber = Number(prefixedMatch[2]);
    const normalizedPrefixed = `${prefix}-${roomNumber}`;
    variants.add(normalizedPrefixed);

    const floorDigit = FLOOR_PREFIX_TO_DIGIT[prefix];
    const compactNumeric = String(floorDigit * 100 + roomNumber);
    variants.add(compactNumeric);

    if (floorDigit === 0) {
      variants.add(String(roomNumber));
      variants.add(String(roomNumber).padStart(3, "0"));
    }
  }

  const numericMatch = raw.match(/^\d{1,4}$/);
  if (numericMatch) {
    const numericValue = Number(raw);

    if (numericValue >= 100) {
      const floorDigit = Math.floor(numericValue / 100);
      const roomNumber = numericValue % 100;

      if (FLOOR_DIGIT_TO_PREFIX[floorDigit] && roomNumber > 0) {
        variants.add(`${FLOOR_DIGIT_TO_PREFIX[floorDigit]}-${roomNumber}`);
      }
    } else if (numericValue > 0) {
      variants.add(`G-${numericValue}`);
    }
  }

  return [...variants];
};

const toPrefixedRoom = (roomInput) => {
  const raw = String(roomInput || "")
    .trim()
    .toUpperCase();
  if (!raw) return "";

  const prefixedMatch = raw.match(/^([GFST])\s*-\s*(\d{1,3})$/);
  if (prefixedMatch) {
    return `${prefixedMatch[1]}-${Number(prefixedMatch[2])}`;
  }

  if (!/^\d{1,4}$/.test(raw)) return raw;

  const numericValue = Number(raw);
  if (numericValue >= 100) {
    const floorDigit = Math.floor(numericValue / 100);
    const roomNumber = numericValue % 100;

    if (FLOOR_DIGIT_TO_PREFIX[floorDigit] && roomNumber > 0) {
      return `${FLOOR_DIGIT_TO_PREFIX[floorDigit]}-${roomNumber}`;
    }
  }

  if (numericValue > 0) {
    return `G-${numericValue}`;
  }

  return raw;
};

/* ======================================================
   STUDENT REGISTRATION REQUEST
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
      parentName,
      parentPhone,
      bloodGroup,
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

    const roomVariants = buildRoomVariants(roomNO);
    const normalizedRoomNO = toPrefixedRoom(roomNO);

    const existingRoomAllocation = await User.findOne({
      hostelBlock,
      roomNO: { $in: roomVariants },
    });

    if (existingRoomAllocation) {
      return res
        .status(400)
        .json({ message: "This room is already allocated" });
    }

    const existingPendingRoomRequest = await StudentRegRequest.findOne({
      hostelBlock,
      status: "pending",
      roomNO: { $in: roomVariants },
    });

    if (existingPendingRoomRequest) {
      return res
        .status(400)
        .json({ message: "This room already has a pending request" });
    }

    const existingStudent = await User.findOne({
      $or: [{ studentID }, { collegeEmail }],
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
      roomNO: normalizedRoomNO,
      password: hashedPassword,
      parentName: parentName || "",
      parentPhone: parentPhone || "",
      bloodGroup: bloodGroup || "",
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
   GET UNAVAILABLE ROOMS FOR REGISTRATION
====================================================== */
export const getUnavailableRooms = async (req, res) => {
  try {
    const { hostelBlock } = req.query;

    if (!hostelBlock) {
      return res
        .status(400)
        .json({ success: false, message: "hostelBlock is required" });
    }

    const [allocatedRooms, pendingRooms] = await Promise.all([
      User.find({ hostelBlock }).select("roomNO -_id"),
      StudentRegRequest.find({ hostelBlock, status: "pending" }).select(
        "roomNO -_id",
      ),
    ]);

    const unavailableRoomSet = new Set();

    for (const entry of [...allocatedRooms, ...pendingRooms]) {
      const normalized = toPrefixedRoom(entry.roomNO);
      if (normalized) unavailableRoomSet.add(normalized);
    }

    return res.json({
      success: true,
      rooms: [...unavailableRoomSet],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

    const accessToken = generateAccessToken({
      _id: student._id,
      role: "student",
    });

    const refreshToken = generateRefreshToken({
      _id: student._id,
    });

    await redis.set(
      `refresh:${student._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60,
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
      7 * 24 * 60 * 60,
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
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const storedToken = await redis.get(`refresh:${decoded.userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    let user =
      (await User.findById(decoded.userId)) ||
      (await Admin.findById(decoded.userId));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

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
