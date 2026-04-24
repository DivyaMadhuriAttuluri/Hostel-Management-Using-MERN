import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import ProtectedRoute from "../components/layout/ProtectedRoute";

// auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import OAuthSuccess from "../pages/auth/OAuthSuccess";
import ForgotPassword from "../pages/auth/ForgotPassword";
import RegistrationStatus from "../pages/auth/RegistrationStatus";

// common pages
import LandingPage from "../pages/common/LandingPage";

// student pages
import StudentDashboard from "../pages/student/Dashboard";
import GuestRoomBooking from "../pages/student/GuestRoomBooking";
import StudentProfile from "../pages/student/Profile";
import ChangePassword from "../pages/student/ChangePassword";
import Complaints from "../pages/student/Complaints";
import MessLeaves from "../pages/student/MessLeaves";
import MyBookings from "../pages/student/MyBookings";
import MyInvoices from "../pages/student/MyInvoices";
import Announcements from "../pages/student/Announcements";
import RoomChange from "../pages/student/RoomChange";
import MessMenu from "../pages/student/MessMenu";
import StudentAttendance from "../pages/student/StudentAttendance";

// admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageBookings from "../pages/admin/ManageBookings";
import ManageStudents from "../pages/admin/ManageStudents";
import ManageComplaints from "../pages/admin/ManageComplaints";
import ManageInvoices from "../pages/admin/ManageInvoices";
import ManageMessLeaves from "../pages/admin/ManageMessLeaves";
import ManageAnnouncements from "../pages/admin/ManageAnnouncements";
import AdminAttendance from "../pages/admin/Attendance";
import AdminProfile from "../pages/admin/AdminProfile";
import AdminChangePassword from "../pages/admin/AdminChangePassword";
import ManageMessMenu from "../pages/admin/ManageMessMenu";
import ManageRoomChanges from "../pages/admin/ManageRoomChanges";

const AppRoutes = () => {
  const { isAuthenticated, authUser } = useContext(AuthContext);

  return (
    <Routes>
      {/* ========== PUBLIC ROUTES ========== */}
      <Route path="/home" element={<LandingPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/registration-status" element={<RegistrationStatus />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate
              to={authUser.role === "admin" ? "/admin" : "/student"}
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/student" replace /> : <Register />
        }
      />

      {/* ========== STUDENT ROUTES ========== */}
      <Route
        path="/student"
        element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>}
      />
      <Route
        path="/student/guest-room-booking"
        element={<ProtectedRoute role="student"><GuestRoomBooking /></ProtectedRoute>}
      />
      <Route
        path="/student/profile"
        element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>}
      />
      <Route
        path="/student/change-password"
        element={<ProtectedRoute role="student"><ChangePassword /></ProtectedRoute>}
      />
      <Route
        path="/student/complaints"
        element={<ProtectedRoute role="student"><Complaints /></ProtectedRoute>}
      />
      <Route
        path="/student/mess-leaves"
        element={<ProtectedRoute role="student"><MessLeaves /></ProtectedRoute>}
      />
      <Route
        path="/student/my-bookings"
        element={<ProtectedRoute role="student"><MyBookings /></ProtectedRoute>}
      />
      <Route
        path="/student/invoices"
        element={<ProtectedRoute role="student"><MyInvoices /></ProtectedRoute>}
      />
      <Route
        path="/student/announcements"
        element={<ProtectedRoute role="student"><Announcements /></ProtectedRoute>}
      />
      <Route
        path="/student/room-change"
        element={<ProtectedRoute role="student"><RoomChange /></ProtectedRoute>}
      />
      <Route
        path="/student/mess-menu"
        element={<ProtectedRoute role="student"><MessMenu /></ProtectedRoute>}
      />
      <Route
        path="/student/attendance"
        element={<ProtectedRoute role="student"><StudentAttendance /></ProtectedRoute>}
      />

      {/* ========== ADMIN ROUTES ========== */}
      <Route
        path="/admin"
        element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/admin/bookings"
        element={<ProtectedRoute role="admin"><ManageBookings /></ProtectedRoute>}
      />
      <Route
        path="/admin/students"
        element={<ProtectedRoute role="admin"><ManageStudents /></ProtectedRoute>}
      />
      <Route
        path="/admin/complaints"
        element={<ProtectedRoute role="admin"><ManageComplaints /></ProtectedRoute>}
      />
      <Route
        path="/admin/invoices"
        element={<ProtectedRoute role="admin"><ManageInvoices /></ProtectedRoute>}
      />
      <Route
        path="/admin/mess-leaves"
        element={<ProtectedRoute role="admin"><ManageMessLeaves /></ProtectedRoute>}
      />
      <Route
        path="/admin/announcements"
        element={<ProtectedRoute role="admin"><ManageAnnouncements /></ProtectedRoute>}
      />
      <Route
        path="/admin/attendance"
        element={<ProtectedRoute role="admin"><AdminAttendance /></ProtectedRoute>}
      />
      <Route
        path="/admin/profile"
        element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>}
      />
      <Route
        path="/admin/change-password"
        element={<ProtectedRoute role="admin"><AdminChangePassword /></ProtectedRoute>}
      />
      <Route
        path="/admin/mess-menu"
        element={<ProtectedRoute role="admin"><ManageMessMenu /></ProtectedRoute>}
      />
      <Route
        path="/admin/room-changes"
        element={<ProtectedRoute role="admin"><ManageRoomChanges /></ProtectedRoute>}
      />

      {/* ========== DEFAULT ========== */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRoutes;

