import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import redis from "../lib/redis.js";
import { sendGenericEmail } from "../lib/sendEmail.js";

/* ======================================================
   FORGOT PASSWORD — Send OTP
   POST /api/auth/forgot-password
====================================================== */
export const forgotPassword = async (req, res) => {
  try {
    const rawEmail = req.body.collegeEmail || req.body.email;
    const normalizedEmail = (rawEmail || "").toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const student = await User.findOne({ collegeEmail: normalizedEmail });
    const admin = student
      ? null
      : await Admin.findOne({ email: normalizedEmail });

    if (!student && !admin) {
      return res
        .status(404)
        .json({ message: "No account found with this email." });
    }

    const recipientName = student ? student.fullName : admin.name;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 10-minute expiry
    await redis.set(`otp:forgot:${normalizedEmail}`, otp, "EX", 600);

    // Send OTP via email
    await sendGenericEmail({
      to: normalizedEmail,
      subject: "Password Reset OTP — Hostel Management",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello <b>${recipientName}</b>,</p>
        <p>Your OTP for password reset is:</p>
        <h1 style="color: #3B82F6; letter-spacing: 8px; font-size: 36px;">${otp}</h1>
        <p>This OTP is valid for <b>10 minutes</b>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p>Regards,<br/>Hostel Administration</p>
      `,
    });

    res.json({
      success: true,
      message: "OTP sent to your email address",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   RESET PASSWORD — Verify OTP & Set New Password
   POST /api/auth/reset-password
====================================================== */
export const resetPassword = async (req, res) => {
  try {
    const rawEmail = req.body.collegeEmail || req.body.email;
    const normalizedEmail = (rawEmail || "").toLowerCase().trim();
    const { otp, newPassword } = req.body;

    if (!normalizedEmail || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    // Verify OTP from Redis
    const storedOtp = await redis.get(`otp:forgot:${normalizedEmail}`);

    if (!storedOtp) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Find account and update password
    const student = await User.findOne({ collegeEmail: normalizedEmail });
    const admin = student
      ? null
      : await Admin.findOne({ email: normalizedEmail });

    if (!student && !admin) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (student) {
      student.password = await bcrypt.hash(newPassword, 10);
      await student.save();
    }

    if (admin) {
      admin.password = await bcrypt.hash(newPassword, 10);
      await admin.save();
    }

    // Delete OTP from Redis
    await redis.del(`otp:forgot:${normalizedEmail}`);

    res.json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   CHANGE PASSWORD — Send OTP (Protected)
   POST /api/auth/change-password/send-otp
====================================================== */
export const sendChangePasswordOtp = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters",
        });
    }

    let account;
    let recipientEmail;
    let recipientName;

    if (req.role === "student") {
      account = await User.findById(req.user._id);
      recipientEmail = account?.collegeEmail;
      recipientName = account?.fullName;
    } else if (req.role === "admin") {
      account = await Admin.findById(req.user._id);
      recipientEmail = account?.email;
      recipientName = account?.name;
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Unsupported role" });
    }

    if (!account || !recipientEmail) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, account.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const redisKey = `otp:change:${req.role}:${account._id}`;

    await redis.set(
      redisKey,
      JSON.stringify({ otp, newPasswordHash }),
      "EX",
      600,
    );

    await sendGenericEmail({
      to: recipientEmail,
      subject: "Password Change OTP — Hostel Management",
      html: `
        <h2>Password Change Verification</h2>
        <p>Hello <b>${recipientName}</b>,</p>
        <p>Use this OTP to confirm your password change:</p>
        <h1 style="color: #3B82F6; letter-spacing: 8px; font-size: 36px;">${otp}</h1>
        <p>This OTP is valid for <b>10 minutes</b>.</p>
        <p>If you did not request this, please secure your account immediately.</p>
        <br/>
        <p>Regards,<br/>Hostel Administration</p>
      `,
    });

    return res.json({
      success: true,
      message: "OTP sent to your registered email address",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   CHANGE PASSWORD — Verify OTP (Protected)
   POST /api/auth/change-password/verify-otp
====================================================== */
export const verifyChangePasswordOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res
        .status(400)
        .json({ success: false, message: "OTP is required" });
    }

    const redisKey = `otp:change:${req.role}:${req.user._id}`;
    const storedPayload = await redis.get(redisKey);

    if (!storedPayload) {
      return res
        .status(400)
        .json({
          success: false,
          message: "OTP expired. Please request a new OTP.",
        });
    }

    let parsed;
    try {
      parsed = JSON.parse(storedPayload);
    } catch (parseError) {
      await redis.del(redisKey);
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid OTP session. Please request OTP again.",
        });
    }

    if (parsed.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    let account;
    if (req.role === "student") {
      account = await User.findById(req.user._id);
    } else if (req.role === "admin") {
      account = await Admin.findById(req.user._id);
    }

    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    account.password = parsed.newPasswordHash;
    await account.save();
    await redis.del(redisKey);

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   CHECK REGISTRATION STATUS (Public — No Auth)
   POST /api/auth/registration-status
====================================================== */
import StudentRegRequest from "../models/StudentRegRequest.js";

export const checkRegistrationStatus = async (req, res) => {
  try {
    const { studentID, collegeEmail } = req.body;

    if (!studentID || !collegeEmail) {
      return res
        .status(400)
        .json({ message: "Student ID and college email are required" });
    }

    // First check if already an approved user
    const existingUser = await User.findOne({
      studentID,
      collegeEmail: collegeEmail.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.json({
        success: true,
        status: "approved",
        message: "Your registration has been approved. You can login now.",
        hostelBlock: existingUser.hostelBlock,
        roomNO: existingUser.roomNO,
      });
    }

    // Check registration requests
    const request = await StudentRegRequest.findOne({
      studentID,
      collegeEmail: collegeEmail.toLowerCase().trim(),
    }).sort({ createdAt: -1 });

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "No registration request found with this Student ID and email.",
      });
    }

    res.json({
      success: true,
      status: request.status,
      message:
        request.status === "pending"
          ? "Your registration is pending admin approval."
          : `Your registration was ${request.status}.${request.rejectionReason ? " Reason: " + request.rejectionReason : ""}`,
      hostelBlock: request.hostelBlock,
      roomNO: request.roomNO,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
