import DashboardLayout from "../../components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { getAdminDashboardStats } from "../../api/user.api";
import {
  FaUsers, FaBed, FaCircleExclamation, FaUtensils,
  FaUserCheck, FaClipboardCheck, FaChartLine, FaBullhorn,
  FaFileInvoiceDollar, FaArrowRightArrowLeft, FaCalendarCheck,
  FaClipboardList, FaChevronRight,
} from "react-icons/fa6";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981"];

const QUICK_ACTIONS = [
  { to: "/admin/students",    icon: FaUserCheck,           label: "Approve Students",  desc: "Review pending registrations",   gradient: "from-blue-500 to-indigo-600",    shadow: "shadow-blue-500/25" },
  { to: "/admin/complaints",  icon: FaCircleExclamation,   label: "Complaints",         desc: "Manage student complaints",       gradient: "from-orange-500 to-rose-500",    shadow: "shadow-orange-500/25" },
  { to: "/admin/mess-leaves", icon: FaUtensils,            label: "Mess Leaves",        desc: "Approve/reject leave requests",   gradient: "from-emerald-500 to-teal-600",   shadow: "shadow-emerald-500/25" },
  { to: "/admin/bookings",    icon: FaBed,                 label: "Room Bookings",      desc: "Manage guest room requests",      gradient: "from-violet-500 to-purple-600",  shadow: "shadow-violet-500/25" },
  { to: "/admin/attendance",  icon: FaCalendarCheck,       label: "Mark Attendance",    desc: "Daily attendance tracking",       gradient: "from-cyan-500 to-blue-500",      shadow: "shadow-cyan-500/25" },
  { to: "/admin/invoices",    icon: FaFileInvoiceDollar,   label: "Invoices",           desc: "Generate and manage invoices",    gradient: "from-pink-500 to-rose-600",      shadow: "shadow-pink-500/25" },
];

const StatCard = ({ title, value, icon: Icon, gradient, sub, delay, to }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden ${gradient}`}
  >
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
    <div className="absolute -right-2 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
    <div className="relative">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium opacity-90">{title}</p>
      </div>
      <p className="text-4xl font-extrabold mb-1">{value ?? "—"}</p>
      {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
      {to && (
        <Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold mt-3 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
          View all <FaChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const { authUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalStudents: 0, pendingBookings: 0, openComplaints: 0,
    messLeaveRequests: 0, attendanceData: [], complaintsData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAdminDashboardStats();
        if (data.success) setStats(data.stats);
      } catch (e) {
        console.error("Admin dashboard stats error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout>
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
            Admin Dashboard <span className="text-2xl">🛡️</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-200">{authUser?.name || "Admin"}</span> — Block {authUser?.hostelBlock} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/announcements" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all">
            <FaBullhorn className="w-4 h-4" />
            New Announcement
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Students" value={loading ? "—" : stats.totalStudents}
          icon={FaUsers} gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          sub="Registered & approved" to="/admin/students" delay={0.1} />
        <StatCard title="Pending Bookings" value={loading ? "—" : stats.pendingBookings}
          icon={FaBed} gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          sub="Guest room requests" to="/admin/bookings" delay={0.2} />
        <StatCard title="Open Complaints" value={loading ? "—" : stats.openComplaints}
          icon={FaCircleExclamation} gradient="bg-gradient-to-br from-orange-500 to-rose-500"
          sub="Pending resolution" to="/admin/complaints" delay={0.3} />
        <StatCard title="Mess Leave Requests" value={loading ? "—" : stats.messLeaveRequests}
          icon={FaUtensils} gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          sub="Active requests" to="/admin/mess-leaves" delay={0.4} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Attendance Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-2 mb-6">
            <FaChartLine className="w-4 h-4 text-blue-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Weekly Attendance Overview</h3>
          </div>
          <div className="h-64">
            {stats.attendanceData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.attendanceData}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "10px", color: "#fff", fontSize: 12 }} />
                  <Area type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" name="Present" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No attendance data yet</div>
            )}
          </div>
        </motion.div>

        {/* Complaints Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-2 mb-6">
            <FaCircleExclamation className="w-4 h-4 text-orange-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Complaint Status</h3>
          </div>
          <div className="h-44">
            {stats.complaintsData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.complaintsData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {stats.complaintsData.map((entry, index) => (
                      <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data</div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {stats.complaintsData?.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || COLORS[i % COLORS.length] }} />
                <span className="text-xs text-slate-500 dark:text-slate-400">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, desc, gradient, shadow }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 + i * 0.05 }}
            >
              <Link
                to={to}
                className={`group flex flex-col items-center gap-2 p-4 bg-gradient-to-br ${gradient} rounded-2xl text-white shadow-lg ${shadow} hover:shadow-xl hover:-translate-y-1 transition-all`}
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-center leading-tight">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
