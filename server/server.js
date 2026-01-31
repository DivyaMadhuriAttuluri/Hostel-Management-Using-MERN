import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";

// ------------------ ROUTES ------------------ //
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import adminRoutes from "./routes/admin.js";
import complaintRoutes from "./routes/complaints.js";
import attendanceRoutes from "./routes/attendance.js";
import messLeaveRoutes from "./routes/messLeave.js";
import invoiceRoutes from "./routes/invoices.js";
import roomBookingRoutes from "./routes/roomBooking.js";
import registrationRoutes from "./routes/registration.js";
import announcementRoutes from "./routes/announcements.js";

const app = express();

// ------------------ MIDDLEWARE ------------------ //

// ✅ Allow requests from ALL client URLs (works with cookies)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, curl)
      if (!origin) return callback(null, true);

      // Allow any browser origin
      return callback(null, origin);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));

// ------------------ ROUTES ------------------ //
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/mess-leave", messLeaveRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/room-booking", roomBookingRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/announcements", announcementRoutes);

// ------------------ START SERVER ------------------ //
const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
