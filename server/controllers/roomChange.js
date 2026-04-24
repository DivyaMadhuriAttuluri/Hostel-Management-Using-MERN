import RoomChangeRequest from "../models/RoomChangeRequest.js";
import User from "../models/User.js";
import { notify } from "../lib/notify.js";

/* ======================================================
   STUDENT: Create Room Change Request
   POST /api/room-change
====================================================== */
export const createRoomChangeRequest = async (req, res) => {
  try {
    if (req.role !== "student") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { requestedRoomNO, reason } = req.body;

    if (!requestedRoomNO || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if student already has a pending request
    const existingRequest = await RoomChangeRequest.findOne({
      student: req.user._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending room change request",
      });
    }

    // Check if requested room is occupied
    const roomOccupied = await User.findOne({
      hostelBlock: req.user.hostelBlock,
      roomNO: requestedRoomNO,
      isActive: true,
    });

    if (roomOccupied) {
      return res.status(400).json({
        message: "The requested room is already occupied",
      });
    }

    const request = await RoomChangeRequest.create({
      student: req.user._id,
      currentHostelBlock: req.user.hostelBlock,
      currentRoomNO: req.user.roomNO,
      requestedRoomNO,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Room change request submitted successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   STUDENT: Get My Room Change Requests
   GET /api/room-change/my
====================================================== */
export const getMyRoomChangeRequests = async (req, res) => {
  try {
    if (req.role !== "student") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const requests = await RoomChangeRequest.find({
      student: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   ADMIN: Get All Room Change Requests for Block
   GET /api/room-change/admin
====================================================== */
export const getBlockRoomChangeRequests = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const requests = await RoomChangeRequest.find({
      currentHostelBlock: req.user.hostelBlock,
    })
      .populate("student", "fullName studentID roomNO")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   ADMIN: Approve/Reject Room Change
   PATCH /api/room-change/:id
====================================================== */
export const updateRoomChangeStatus = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { status, adminRemarks } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await RoomChangeRequest.findById(req.params.id).populate(
      "student"
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.currentHostelBlock !== req.user.hostelBlock) {
      return res
        .status(403)
        .json({ message: "Not authorized for this block" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    request.status = status;
    request.adminRemarks = adminRemarks || null;
    await request.save();

    // If approved, update the student's room number
    if (status === "approved") {
      await User.findByIdAndUpdate(request.student._id, {
        roomNO: request.requestedRoomNO,
      });

      await notify({
        studentId: request.student._id,
        type: "complaint", // reuse type
        title: "Room Change Approved ✅",
        message: `Your room change request to Room ${request.requestedRoomNO} has been approved.`,
        refId: request._id,
      });
    } else {
      await notify({
        studentId: request.student._id,
        type: "complaint",
        title: "Room Change Rejected ❌",
        message: `Your room change request was rejected. ${
          adminRemarks ? "Reason: " + adminRemarks : ""
        }`,
        refId: request._id,
      });
    }

    res.json({ success: true, message: `Request ${status}`, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
