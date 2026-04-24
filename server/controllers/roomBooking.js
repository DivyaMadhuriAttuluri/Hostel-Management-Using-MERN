import RoomBook from "../models/RoomBook.js";
import GuestRoom from "../models/GuestRoom.js";
import User from "../models/User.js";
import { notify } from "../lib/notify.js";
import { sendGenericEmail } from "../lib/sendEmail.js";

export const getAvailableRooms = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      return res
        .status(404)
        .json({ success: false, message: "dateFrom and dateTo are required" });
    }

    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    // Get all rooms (1-100)
    const allRooms = await GuestRoom.find({
      guestHostelBlock: "GUEST_HOSTEL",
      isActive: true,
    }).sort({ roomNo: 1 });

    // Get booked rooms for the selected date range
    const bookedRooms = await RoomBook.find({
      guestHostelBlock: "GUEST_HOSTEL",
      status: "approved",
      $or: [{ dateFrom: { $lte: to }, dateTo: { $gte: from } }],
    }).distinct("guestRoomNO");

    // Get pending bookings for the selected date range
    const pendingRooms = await RoomBook.find({
      guestHostelBlock: "GUEST_HOSTEL",
      status: "pending",
      $or: [{ dateFrom: { $lte: to }, dateTo: { $gte: from } }],
    }).distinct("guestRoomNO");

    // Ensure we have all 100 rooms (create missing ones)
    const existingRoomNos = allRooms.map((r) => r.roomNo.toString());
    const allRoomNos = [];
    for (let i = 1; i <= 100; i++) {
      const roomNo = i.toString().padStart(3, "0");
      allRoomNos.push(roomNo);
    }

    // Map all rooms with their status
    const roomsWithStatus = allRoomNos.map((roomNo) => {
      const existingRoom = allRooms.find((r) => r.roomNo.toString() === roomNo);
      let status = "available";

      // Convert bookedRooms and pendingRooms to strings for comparison
      const bookedRoomStrings = bookedRooms.map((r) => r.toString());
      const pendingRoomStrings = pendingRooms.map((r) => r.toString());

      if (bookedRoomStrings.includes(roomNo)) {
        status = "booked";
      } else if (pendingRoomStrings.includes(roomNo)) {
        status = "pending";
      }

      return {
        roomNo: roomNo,
        status: status,
        capacity: existingRoom?.capacity || 2,
      };
    });

    // Also return just available rooms for backward compatibility
    const availableRooms = roomsWithStatus
      .filter((room) => room.status === "available")
      .map((room) => room.roomNo);

    res.json({
      availableRooms,
      allRooms: roomsWithStatus,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const bookRoom = async (req, res) => {
  try {
    if (req.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { visitorName, relation, guestRoomNO, dateFrom, dateTo, purpose } =
      req.body;

    if (!visitorName || !relation || !guestRoomNO || !dateFrom || !dateTo) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    const conflict = await RoomBook.findOne({
      guestHostelBlock: "GUEST_HOSTEL",
      guestRoomNO,
      status: "approved",
      $or: [{ dateFrom: { $lte: to }, dateTo: { $gte: from } }],
    });

    if (conflict) {
      return res
        .status(404)
        .json({ message: "Guest room already booked for that room no. " });
    }

    const booking = await RoomBook.create({
      student: req.user._id,
      guestHostelBlock: "GUEST_HOSTEL",
      visitorName,
      relation,
      guestRoomNO,
      dateFrom: from,
      dateTo: to,
      purpose,
    });

    // 📧 Send confirmation email
    try {
      const student = await User.findById(req.user._id).select(
        "collegeEmail fullName",
      );
      if (student?.collegeEmail) {
        await sendGenericEmail({
          to: student.collegeEmail,
          subject: "Guest Room Booking Confirmation — Hostel Management",
          html: `
                        <h2>Guest Room Booking Confirmation</h2>
                        <p>Hello <b>${student.fullName}</b>,</p>
                        <p>Your guest room booking has been successfully submitted.</p>
                        <br/>
                        <h3>Booking Details:</h3>
                        <table style="width:100%; border-collapse:collapse;">
                            <tr><td style="padding:8px; border:1px solid #ddd;"><b>Visitor Name</b></td><td style="padding:8px; border:1px solid #ddd;">${visitorName}</td></tr>
                            <tr><td style="padding:8px; border:1px solid #ddd;"><b>Room Number</b></td><td style="padding:8px; border:1px solid #ddd;">${guestRoomNO}</td></tr>
                            <tr><td style="padding:8px; border:1px solid #ddd;"><b>Check-in Date</b></td><td style="padding:8px; border:1px solid #ddd;">${new Date(from).toLocaleDateString()}</td></tr>
                            <tr><td style="padding:8px; border:1px solid #ddd;"><b>Check-out Date</b></td><td style="padding:8px; border:1px solid #ddd;">${new Date(to).toLocaleDateString()}</td></tr>
                            <tr><td style="padding:8px; border:1px solid #ddd;"><b>Purpose</b></td><td style="padding:8px; border:1px solid #ddd;">${purpose || "N/A"}</td></tr>
                            <tr><td style="padding:8px; border:1px solid #ddd;"><b>Status</b></td><td style="padding:8px; border:1px solid #ddd;"><b>Pending</b> (awaiting admin approval)</td></tr>
                        </table>
                        <br/>
                        <p>The admin will review your booking request and notify you once it is approved or rejected.</p>
                        <p>Thank you for using our hostel portal.</p>
                        <br/>
                        <p>Regards,<br/>Hostel Administration</p>
                    `,
        });
      }
    } catch (emailErr) {
      console.error("Booking confirmation email error:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Guest room booking request submitted",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student: view own bookings
export const getMyBookings = async (req, res) => {
  try {
    if (req.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const bookings = await RoomBook.find({
      student: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//ADMIN: VIEW BOOKINGS FOR THEIR HOSTEL BLOCK STUDENTS

export const getAllRooms = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get all students in the admin's hostel block
    const studentsInBlock = await User.find({
      role: "student",
      hostelBlock: req.user.hostelBlock,
    }).select("_id");

    const studentIds = studentsInBlock.map((s) => s._id);

    // Get bookings for students in this hostel block
    const bookings = await RoomBook.find({
      student: { $in: studentIds },
      guestHostelBlock: "GUEST_HOSTEL",
    })
      .populate("student", "studentID fullName roomNO hostelBlock")
      .sort({ createdAt: -1 });

    return res.json({ bookings });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   ADMIN: APPROVE / REJECT BOOKINGS FOR THEIR BLOCK STUDENTS
====================================================== */
export const updateRoomBookingStatus = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await RoomBook.findById(req.params.id).populate(
      "student",
      "hostelBlock",
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if the booking belongs to a student in the admin's hostel block
    if (booking.student.hostelBlock !== req.user.hostelBlock) {
      return res.status(403).json({
        message:
          "Not authorized. This booking belongs to a student from a different hostel block.",
      });
    }

    booking.status = status;
    await booking.save();

    // Populate student details for email
    const populatedBooking = await RoomBook.findById(booking._id).populate(
      "student",
      "collegeEmail fullName hostelBlock",
    );

    // 🔔 Notify student and send email
    if (status === "approved") {
      await notify({
        studentId: booking.student._id,
        type: "booking",
        title: "Guest Room Booking Approved ✅",
        message: `Your guest room booking (Room ${booking.guestRoomNO}) for ${booking.visitorName} from ${new Date(booking.dateFrom).toLocaleDateString()} to ${new Date(booking.dateTo).toLocaleDateString()} has been approved.`,
        refId: booking._id,
      });

      // 📧 Send approval email
      try {
        if (populatedBooking.student?.collegeEmail) {
          await sendGenericEmail({
            to: populatedBooking.student.collegeEmail,
            subject: "Guest Room Booking Approved ✅ — Hostel Management",
            html: `
              <h2>Guest Room Booking Approved</h2>
              <p>Hello <b>${populatedBooking.student.fullName}</b>,</p>
              <p>Your guest room booking has been <b>APPROVED</b>. Your visitor can now check in.</p>
              <br/>
              <h3>Booking Details:</h3>
              <table style="width:100%; border-collapse:collapse;">
                <tr><td style="padding:8px; border:1px solid #ddd;"><b>Room Number</b></td><td style="padding:8px; border:1px solid #ddd;"><b>${booking.guestRoomNO}</b></td></tr>
                <tr><td style="padding:8px; border:1px solid #ddd;"><b>Visitor Name</b></td><td style="padding:8px; border:1px solid #ddd;">${booking.visitorName}</td></tr>
                <tr><td style="padding:8px; border:1px solid #ddd;"><b>Relation</b></td><td style="padding:8px; border:1px solid #ddd; text-transform: capitalize;">${booking.relation}</td></tr>
                <tr><td style="padding:8px; border:1px solid #ddd;"><b>Check-in Date</b></td><td style="padding:8px; border:1px solid #ddd;">${new Date(booking.dateFrom).toLocaleDateString()}</td></tr>
                <tr><td style="padding:8px; border:1px solid #ddd;"><b>Check-out Date</b></td><td style="padding:8px; border:1px solid #ddd;">${new Date(booking.dateTo).toLocaleDateString()}</td></tr>
                <tr><td style="padding:8px; border:1px solid #ddd;"><b>Purpose</b></td><td style="padding:8px; border:1px solid #ddd;">${booking.purpose || "N/A"}</td></tr>
              </table>
              <br/>
              <p>Please ensure your visitor checks in at the reception desk on the check-in date.</p>
              <p>Thank you for using our hostel portal.</p>
              <br/>
              <p>Regards,<br/>Hostel Administration</p>
            `,
          });
        }
      } catch (emailErr) {
        console.error("Booking approval email error:", emailErr.message);
      }
    } else if (status === "rejected") {
      // 📧 Send rejection email
      try {
        if (populatedBooking.student?.collegeEmail) {
          await sendGenericEmail({
            to: populatedBooking.student.collegeEmail,
            subject: "Guest Room Booking Rejected — Hostel Management",
            html: `
              <h2>Guest Room Booking Rejected</h2>
              <p>Hello <b>${populatedBooking.student.fullName}</b>,</p>
              <p>Unfortunately, your guest room booking has been <b>REJECTED</b>.</p>
              <br/>
              <h3>Booking Details:</h3>
              <table style="width:100%; border-collapse:collapse;">
                <tr><td style="padding:8px; border:1px solid #ddd;"><b>Room Number</b></td><td style="padding:8px; border:1px solid #ddd;">${booking.guestRoomNO}</td></tr>
                <tr><td style="padding:8px; border:1px solid #ddd;"><b>Visitor Name</b></td><td style="padding:8px; border:1px solid #ddd;">${booking.visitorName}</td></tr>
                <tr><td style="padding:8px; border:1px solid #ddd;"><b>Check-in Date</b></td><td style="padding:8px; border:1px solid #ddd;">${new Date(booking.dateFrom).toLocaleDateString()}</td></tr>
                <tr><td style="padding:8px; border:1px solid #ddd;"><b>Check-out Date</b></td><td style="padding:8px; border:1px solid #ddd;">${new Date(booking.dateTo).toLocaleDateString()}</td></tr>
              </table>
              <br/>
              <p>You may try booking a different room or contact the hostel administration for more details.</p>
              <p>Thank you for using our hostel portal.</p>
              <br/>
              <p>Regards,<br/>Hostel Administration</p>
            `,
          });
        }
      } catch (emailErr) {
        console.error("Booking rejection email error:", emailErr.message);
      }
    }

    return res.json({
      success: true,
      message: `Booking ${status}`,
      booking,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
