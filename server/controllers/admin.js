import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Complaint from "../models/Complaint.js";
import Invoice from "../models/Invoice.js";
import MessLeave from "../models/MessLeave.js";
import RoomBook from "../models/RoomBook.js";
import StudentRegRequest from "../models/StudentRegRequest.js";
import Notification from "../models/Notification.js";
import { sendRegistrationStatusEmail } from "../lib/sendEmail.js";

/* ===================================================
   GET ALL STUDENTS (ADMIN)
   GET /api/admin/students
====================================================== */
export const getAllStudentDetails = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      hostelBlock: req.user.hostelBlock,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   GET SINGLE STUDENT FULL DETAILS
   GET /api/admin/students/:studentID
====================================================== */
export const getStudentDetails = async (req, res) => {
  try {
    const student = await User.findOne({
      studentID: req.params.studentID,
      role: "student",
    }).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const complaints = await Complaint.find({ student: student._id });
    const attendance = await Attendance.find({ student: student._id });
    const messLeaves = await MessLeave.find({ student: student._id });
    const invoices = await Invoice.find({
      $or: [{ student: student._id, isBroadcast: true }],
    });
    const guestRoomBookings = await RoomBook.find({
      student: student._id,
    });

    res.json({
      success: true,
      student,
      complaints,
      attendance,
      messLeaves,
      invoices,
      guestRoomBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   GET PENDING STUDENT REGISTRATION REQUESTS
   GET /api/admin/registrations
====================================================== */
export const getPendingRegistrations = async (req, res) => {
  try {
    const requests = await StudentRegRequest.find({
      hostelBlock: req.user.hostelBlock,
      status: "pending",
    });

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   APPROVE STUDENT REGISTRATION
   PATCH /api/admin/students/:requestId/approve
====================================================== */
export const approveStudent = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await StudentRegRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request already processed",
      });
    }

    if (request.hostelBlock !== req.user.hostelBlock) {
      return res.status(403).json({
        success: false,
        message: "Not authorized for this hostel block",
      });
    }

    const existingStudent = await User.findOne({
      studentID: request.studentID,
    });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student already exists",
      });
    }

    const student = await User.create({
      fullName: request.fullName,
      studentID: request.studentID,
      branch: request.branch,
      collegeEmail: request.collegeEmail,
      hostelBlock: request.hostelBlock,
      roomNO: request.roomNO,
      password: request.password,
      isApproved: true,
      approvedBy: req.user._id,
    });

    request.status = "approved";
    await request.save();

    // 📧 Send approval email
    await sendRegistrationStatusEmail({
      to: request.collegeEmail,
      fullName: request.fullName,
      hostelBlock: request.hostelBlock,
      roomNO: request.roomNO,
      status: "approved",
    });

    res.json({
      success: true,
      message: "Student approved successfully",
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
   REJECT STUDENT REGISTRATION
   PATCH /api/admin/students/:requestId/reject
====================================================== */
export const rejectStudent = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const request = await StudentRegRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request already processed",
      });
    }

    if (request.hostelBlock !== req.user.hostelBlock) {
      return res.status(403).json({
        success: false,
        message: "Not authorized for this hostel block",
      });
    }

    request.status = "rejected";
    request.rejectionReason = reason || "Rejected by admin";
    await request.save();

    // 📧 Send rejection email
    await sendRegistrationStatusEmail({
      to: request.collegeEmail,
      fullName: request.fullName,
      status: "rejected",
      rejectionReason: request.rejectionReason,
    });

    res.json({
      success: true,
      message: "Student registration rejected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   ADMIN DASHBOARD STATS
   GET /api/admin/dashboard/stats
====================================================== */
export const getDashboardStats = async (req, res) => {
  try {
    const { hostelBlock } = req.user;

    // 1️⃣ Total students
    const totalStudents = await User.countDocuments({
      role: "student",
      hostelBlock,
      isApproved: true,
    });

    // 2️⃣ Pending room bookings
    const studentsInBlock = await User.find({
      role: "student",
      hostelBlock,
    }).select("_id");

    const studentIds = studentsInBlock.map((s) => s._id);

    const pendingBookings = await RoomBook.countDocuments({
      student: { $in: studentIds },
      status: "pending",
    });

    // 3️⃣ Open complaints
    const openComplaints = await Complaint.countDocuments({
      hostelBlock,
      status: { $in: ["pending", "accepted"] },
    });

    // 4️⃣ Pending mess leave requests
    const messLeaveRequests = await MessLeave.countDocuments({
      hostelBlock,
      status: "pending",
    });

    // 5️⃣ Complaints distribution
    const complaintsDistribution = await Complaint.aggregate([
      { $match: { hostelBlock } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statsMap = { pending: 0, accepted: 0, resolved: 0 };
    complaintsDistribution.forEach((item) => {
      statsMap[item._id] = item.count;
    });

    const complaintsData = [
      { name: "Resolved", value: statsMap.resolved },
      { name: "Pending", value: statsMap.pending },
      { name: "In Progress", value: statsMap.accepted },
    ];

    // 6️⃣ Weekly attendance (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo },
          status: "present",
          student: { $in: studentIds },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
              timezone: "+05:30",
            },
          },
          present: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const attendanceData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

      const found = weeklyAttendance.find((w) => w._id === dateStr);
      attendanceData.push({
        name: dayName,
        date: dateStr,
        present: found ? found.present : 0,
      });
    }

    res.json({
      success: true,
      stats: {
        totalStudents,
        pendingBookings,
        openComplaints,
        messLeaveRequests,
        complaintsData,
        attendanceData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   DELETE STUDENT
   DELETE /api/admin/students/:studentId
====================================================== */
export const deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // 🔐 Admin can only delete students from their own block
    if (student.hostelBlock !== req.user.hostelBlock) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete students from a different hostel block",
      });
    }

    const id = student._id;

    // 🗑️ Remove all related data
    await Promise.all([
      Attendance.deleteMany({ student: id }),
      Complaint.deleteMany({ student: id }),
      Invoice.deleteMany({ student: id }),
      MessLeave.deleteMany({ student: id }),
      RoomBook.deleteMany({ student: id }),
      Notification.deleteMany({ student: id }),
      User.findByIdAndDelete(id),
    ]);

    res.json({
      success: true,
      message: `Student ${student.fullName} (${student.studentID}) deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
