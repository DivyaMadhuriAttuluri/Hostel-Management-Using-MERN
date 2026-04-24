import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import passport from "passport";
import "./lib/passport.js";
import { globalLimiter } from "./middleware/rateLimiter.js";


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
import notificationRoutes from "./routes/notifications.js";
import roomChangeRoutes from "./routes/roomChange.js";
import messMenuRoutes from "./routes/messMenu.js";
import { errorHandler } from "./lib/errorHandler.js";

const app = express();
app.use(passport.initialize());


// ------------------ MIDDLEWARE ------------------ //

// ✅ CORS — allow only the configured frontend origin
const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g. http://localhost:5173
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }

      return callback(
        new Error(`CORS policy: Origin ${origin} is not allowed`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🛡️ Global rate limiter — 200 requests per 15 min per IP
app.use(globalLimiter);

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
app.use("/api/notifications", notificationRoutes);
app.use("/api/room-change", roomChangeRoutes);
app.use("/api/mess-menu", messMenuRoutes);

// ------------------ ERROR HANDLER ------------------ //
app.use(errorHandler);


// ------------------ START SERVER ------------------ //
const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
