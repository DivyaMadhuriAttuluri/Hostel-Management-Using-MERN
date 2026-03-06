import MessLeave from "../models/MessLeave.js";
import { notify } from "../lib/notify.js";

export const applyMessLeave = async (req, res) => {
  try {
    if (req.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { startDate, endDate, reason, dateFrom, dateTo } = req.body;
    const start = startDate || dateFrom;
    const end = endDate || dateTo;

    if (!start || !end || !reason) {
      return res
        .status(404)
        .json({ success: false, message: "Enter all the details" });
    }

    const startDt = new Date(start);
    const endDt = new Date(end);

    if (endDt < startDt)
      return res.status(404).json({ success: false, message: "Enter valid end date" });

    const messLeave = await MessLeave.create({
      student: req.user._id,
      hostelBlock: req.user.hostelBlock,
      startDate: startDt,
      endDate: endDt,
      reason: reason,
      status: "pending",
    });

    res.status(201).json({ success: true, messLeave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyMessLeaves = async (req, res) => {
  try {
    if (req.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const messLeaves = await MessLeave.find({
      student: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ leaves: messLeaves });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBlockMessLeaves = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const allMessLeaves = await MessLeave.find({
      hostelBlock: req.user.hostelBlock,
    })
      .populate("student", "studentID fullName roomNO")
      .sort({ createdAt: -1 });

    res.json({ leaves: allMessLeaves });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveMessLeave = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const leave = await MessLeave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.hostelBlock !== req.user.hostelBlock) {
      return res.status(403).json({ message: "Not authorized for this block" });
    }

    leave.status = "approved";
    await leave.save();

    // 🔔 Notify student
    await notify({
      studentId: leave.student,
      type: "mess_leave",
      title: "Mess Leave Approved ✅",
      message: `Your mess leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been approved.`,
      refId: leave._id,
    });

    res.json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectMessLeave = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const leave = await MessLeave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.hostelBlock !== req.user.hostelBlock) {
      return res.status(403).json({ message: "Not authorized for this block" });
    }

    leave.status = "rejected";

    await leave.save();

    res.json({
      success: true,
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
