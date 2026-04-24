import bcrypt from "bcryptjs";
import User from "../models/User.js";
import RoomBook from "../models/RoomBook.js";
import Complaint from "../models/Complaint.js";
import MessLeave from "../models/MessLeave.js";
import Invoice from "../models/Invoice.js";
import Attendance from "../models/Attendance.js";
import Announcement from "../models/Announcement.js";

/* ======================================================
   GET STUDENT PROFILE
   GET /api/students/profile
====================================================== */
export const getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   UPDATE STUDENT PROFILE
   PUT /api/students/profile
====================================================== */
export const updateStudentProfile = async (req, res) => {
  try {
    const { fullName, branch, profilePic, parentName, parentPhone } = req.body;
    const studentId = req.user._id;

    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (branch) updateData.branch = branch;
    if (profilePic) updateData.profilePic = profilePic;
    if (parentName !== undefined) updateData.parentName = parentName;
    if (parentPhone !== undefined) updateData.parentPhone = parentPhone;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedStudent = await User.findByIdAndUpdate(
      studentId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      student: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   CHANGE STUDENT PASSWORD
   PUT /api/students/change-password
====================================================== */
export const changeStudentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const studentId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const student = await User.findById(studentId);

    const isMatch = await bcrypt.compare(currentPassword, student.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    student.password = await bcrypt.hash(newPassword, 10);
    await student.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   STUDENT DASHBOARD STATS
   GET /api/students/dashboard/stats
====================================================== */
export const getDashboardStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    // 1️⃣ Attendance count
    const totalAttendance = await Attendance.countDocuments({
      student: studentId,
      status: "present",
    });

    // 2️⃣ Active complaints
    const activeComplaints = await Complaint.countDocuments({
      student: studentId,
      status: { $in: ["pending", "open"] },
    });

    // 3️⃣ Mess leave days
    const approvedLeaves = await MessLeave.find({
      student: studentId,
      status: "approved",
    });

    const messLeaveDays = approvedLeaves.reduce((total, leave) => {
      if (!leave.startDate || !leave.endDate) return total;

      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const diff =
        Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      return total + diff;
    }, 0);

    // 4️⃣ Attendance trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const attendanceRecords = await Attendance.find({
      student: studentId,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: 1 });

    const attendanceTrend = attendanceRecords.map((record) => ({
      date: record.date.toISOString().split("T")[0],
      status: record.status,
    }));

    // 5️⃣ Complaints by category
    const complaintsByCategory = await Complaint.aggregate([
      { $match: { student: studentId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", value: "$count" } },
    ]);

    // 6️⃣ Recent announcements
    const block = req.user.hostelBlock;

    const recentAnnouncements = await Announcement.find({
      $or: [{ hostelBlock: "All" }, { hostelBlock: block }],
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // 7️⃣ Recent approved mess leaves
    const recentMessLeaves = await MessLeave.find({
      student: studentId,
      status: "approved",
    })
      .sort({ startDate: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalAttendance,
        activeComplaints,
        messLeaveDays,
        attendanceTrend,
        complaintsByCategory,
        recentAnnouncements,
        recentMessLeaves,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
