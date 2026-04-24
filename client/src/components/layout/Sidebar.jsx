import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthProvider";
import {
  FaGauge,        // Dashboard
  FaBed,          // Guest Room / Room Bookings
  FaBookmark,     // My Bookings
  FaCircleExclamation, // Complaints
  FaUtensils,     // Mess Leave
  FaFileInvoiceDollar, // Invoices
  FaBullhorn,     // Announcements
  FaUsers,        // Students
  FaClipboardCheck,    // Attendance
  FaBars,
  FaXmark,
  FaArrowRightArrowLeft, // Room Change
  FaClipboardList,     // Mess Menu
  FaCalendarCheck,
  FaCircleUser,        // Profile initials fallback
  FaChevronRight,
} from "react-icons/fa6";

const Sidebar = () => {
  const { authUser } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const close = () => setIsMobileMenuOpen(false);

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
    }`;

  const SectionTitle = ({ children }) => (
    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 px-4 mt-5">
      {children}
    </p>
  );

  // User initials avatar
  const initials = authUser?.fullName
    ? authUser.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : authUser?.name
    ? authUser.name.slice(0, 2).toUpperCase()
    : "U";

  const roleColor = authUser?.role === "admin"
    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-white rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle menu"
      >
        <FaBars className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={close}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 md:z-10 transition-transform duration-300 ease-out shadow-xl md:shadow-none`}
      >
        {/* Mobile Header */}
        <div className="md:hidden p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-white text-lg">Menu</span>
          <button onClick={close} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
            <FaXmark className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-0.5 scrollbar-thin">
          {/* ── STUDENT LINKS ── */}
          {authUser?.role === "student" && (
            <>
              <NavLink to="/student" end className={linkClasses} onClick={close}>
                <FaGauge className="w-4 h-4 flex-shrink-0" />
                <span>Dashboard</span>
              </NavLink>

              <SectionTitle>Services</SectionTitle>
              <NavLink to="/student/guest-room-booking" className={linkClasses} onClick={close}>
                <FaBed className="w-4 h-4 flex-shrink-0" />
                <span>Guest Room</span>
              </NavLink>
              <NavLink to="/student/my-bookings" className={linkClasses} onClick={close}>
                <FaBookmark className="w-4 h-4 flex-shrink-0" />
                <span>My Bookings</span>
              </NavLink>
              <NavLink to="/student/complaints" className={linkClasses} onClick={close}>
                <FaCircleExclamation className="w-4 h-4 flex-shrink-0" />
                <span>Complaints</span>
              </NavLink>
              <NavLink to="/student/mess-leaves" className={linkClasses} onClick={close}>
                <FaUtensils className="w-4 h-4 flex-shrink-0" />
                <span>Mess Leaves</span>
              </NavLink>
              <NavLink to="/student/mess-menu" className={linkClasses} onClick={close}>
                <FaClipboardList className="w-4 h-4 flex-shrink-0" />
                <span>Mess Menu</span>
              </NavLink>
              <NavLink to="/student/invoices" className={linkClasses} onClick={close}>
                <FaFileInvoiceDollar className="w-4 h-4 flex-shrink-0" />
                <span>Invoices</span>
              </NavLink>

              <SectionTitle>Info</SectionTitle>
              <NavLink to="/student/announcements" className={linkClasses} onClick={close}>
                <FaBullhorn className="w-4 h-4 flex-shrink-0" />
                <span>Announcements</span>
              </NavLink>
              <NavLink to="/student/attendance" className={linkClasses} onClick={close}>
                <FaCalendarCheck className="w-4 h-4 flex-shrink-0" />
                <span>My Attendance</span>
              </NavLink>
              <NavLink to="/student/room-change" className={linkClasses} onClick={close}>
                <FaArrowRightArrowLeft className="w-4 h-4 flex-shrink-0" />
                <span>Room Change</span>
              </NavLink>
            </>
          )}

          {/* ── ADMIN LINKS ── */}
          {authUser?.role === "admin" && (
            <>
              <NavLink to="/admin" end className={linkClasses} onClick={close}>
                <FaGauge className="w-4 h-4 flex-shrink-0" />
                <span>Dashboard</span>
              </NavLink>

              <SectionTitle>Management</SectionTitle>
              <NavLink to="/admin/students" className={linkClasses} onClick={close}>
                <FaUsers className="w-4 h-4 flex-shrink-0" />
                <span>Manage Students</span>
              </NavLink>
              <NavLink to="/admin/bookings" className={linkClasses} onClick={close}>
                <FaBed className="w-4 h-4 flex-shrink-0" />
                <span>Room Bookings</span>
              </NavLink>
              <NavLink to="/admin/complaints" className={linkClasses} onClick={close}>
                <FaCircleExclamation className="w-4 h-4 flex-shrink-0" />
                <span>Complaints</span>
              </NavLink>
              <NavLink to="/admin/mess-leaves" className={linkClasses} onClick={close}>
                <FaUtensils className="w-4 h-4 flex-shrink-0" />
                <span>Mess Leaves</span>
              </NavLink>
              <NavLink to="/admin/mess-menu" className={linkClasses} onClick={close}>
                <FaClipboardList className="w-4 h-4 flex-shrink-0" />
                <span>Mess Menu</span>
              </NavLink>
              <NavLink to="/admin/invoices" className={linkClasses} onClick={close}>
                <FaFileInvoiceDollar className="w-4 h-4 flex-shrink-0" />
                <span>Invoices</span>
              </NavLink>

              <SectionTitle>Operations</SectionTitle>
              <NavLink to="/admin/announcements" className={linkClasses} onClick={close}>
                <FaBullhorn className="w-4 h-4 flex-shrink-0" />
                <span>Announcements</span>
              </NavLink>
              <NavLink to="/admin/attendance" className={linkClasses} onClick={close}>
                <FaClipboardCheck className="w-4 h-4 flex-shrink-0" />
                <span>Attendance</span>
              </NavLink>
              <NavLink to="/admin/room-changes" className={linkClasses} onClick={close}>
                <FaArrowRightArrowLeft className="w-4 h-4 flex-shrink-0" />
                <span>Room Changes</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* User Card Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate leading-none mb-1">
                {authUser?.fullName || authUser?.name || "User"}
              </p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize ${roleColor}`}>
                {authUser?.role || "student"}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-600 mt-2">
            © 2025 Hostel Management
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
