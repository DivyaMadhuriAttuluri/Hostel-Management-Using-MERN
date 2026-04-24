import { useEffect, useState, useContext } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { AuthContext } from "../../context/AuthProvider";
import { getStudentDashboardStats } from "../../api/user.api";
import { getMyNotifications, markAllRead, markOneRead } from "../../api/notifications.api";
import Loader from "../../components/common/Loader";
import { Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  FaCalendarCheck, FaCircleExclamation, FaUtensils, FaBell,
  FaCheckDouble, FaBullhorn, FaBed, FaArrowRightArrowLeft,
  FaClipboardList, FaFileInvoiceDollar, FaCircleCheck,
  FaCircleXmark, FaWrench, FaDroplet, FaBolt, FaFire,
  FaClock, FaChevronRight,
} from "react-icons/fa6";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const QUICK_LINKS = [
  { to: "/student/guest-room-booking", icon: FaBed,                label: "Book Room",     color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
  { to: "/student/complaints",         icon: FaCircleExclamation,  label: "Complaint",     color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
  { to: "/student/mess-leaves",        icon: FaUtensils,           label: "Mess Leave",    color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
  { to: "/student/mess-menu",          icon: FaClipboardList,      label: "Mess Menu",     color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20" },
  { to: "/student/invoices",           icon: FaFileInvoiceDollar,  label: "Invoices",      color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20" },
  { to: "/student/room-change",        icon: FaArrowRightArrowLeft, label: "Room Change",  color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20" },
];

const NOTIF_ICONS = {
  complaint: <FaWrench className="text-orange-400" />,
  mess_leave: <FaUtensils className="text-green-400" />,
  booking: <FaBed className="text-blue-400" />,
  invoice: <FaFileInvoiceDollar className="text-violet-400" />,
};

const StatCard = ({ icon: Icon, label, value, sub, gradient }) => (
  <div className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden ${gradient}`}>
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
    <div className="relative">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium opacity-90">{label}</p>
      </div>
      <p className="text-4xl font-extrabold mb-1">{value}</p>
      {sub && <p className="text-xs opacity-70">{sub}</p>}
    </div>
  </div>
);

const StudentDashboard = () => {
  const { authUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalAttendance: 0, activeComplaints: 0, messLeaveDays: 0,
    attendanceTrend: [], complaintsByCategory: [],
    recentAnnouncements: [], recentMessLeaves: [],
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, notifRes] = await Promise.all([
          getStudentDashboardStats(),
          getMyNotifications(),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (notifRes.data.success) {
          setNotifications(notifRes.data.notifications);
          setUnreadCount(notifRes.data.unreadCount);
        }
      } catch (e) {
        console.error("Dashboard load error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleMarkOne = async (id) => {
    await markOneRead(id);
    setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  if (loading) return <Loader />;

  const graphData = stats.attendanceTrend?.map(item => ({
    date: item.date,
    statusVal: item.status === "present" ? 1 : 0,
    status: item.status,
  })) || [];

  return (
    <DashboardLayout>
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
          Welcome back, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{authUser?.fullName?.split(" ")[0]}</span>! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} — Block {authUser?.hostelBlock}, Room {authUser?.roomNO}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard icon={FaCalendarCheck}      label="Total Attendance"  value={stats.totalAttendance || 0}  sub="Days present this semester" gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <StatCard icon={FaCircleExclamation}  label="Active Complaints" value={stats.activeComplaints || 0}  sub="Pending resolution"         gradient="bg-gradient-to-br from-orange-500 to-rose-500" />
        <StatCard icon={FaUtensils}           label="Mess Leave Days"   value={stats.messLeaveDays || 0}     sub="Approved this month"        gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
      </div>

      {/* ── Quick Links ── */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">Quick Access</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK_LINKS.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attendance Trend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-800 dark:text-white mb-5">Attendance Trend (Last 7 Days)</h2>
          <div className="h-60">
            {graphData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" domain={[0, 1]} ticks={[0, 1]} tickFormatter={v => v === 1 ? "P" : "A"} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "10px", color: "#fff", fontSize: 12 }} />
                  <Line type="step" dataKey="statusVal" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }} name="Status" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No attendance data yet</div>
            )}
          </div>
        </div>

        {/* Complaints by Category */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-800 dark:text-white mb-5">Complaints by Category</h2>
          <div className="h-60 flex items-center justify-center">
            {stats.complaintsByCategory?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.complaintsByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label>
                    {stats.complaintsByCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "10px", color: "#fff", fontSize: 12 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">No complaint data</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Notifications ── */}
      <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FaBell className="w-4 h-4 text-blue-500" />
            <h2 className="font-bold text-slate-800 dark:text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 transition-colors font-medium">
              <FaCheckDouble className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-center text-slate-400 py-10 text-sm">No notifications yet</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {notifications.map(n => (
              <li
                key={n._id}
                onClick={() => !n.isRead && handleMarkOne(n._id)}
                className={`flex items-start gap-3 px-6 py-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  !n.isRead ? "border-l-4 border-blue-500 bg-blue-50/30 dark:bg-blue-900/10" : "border-l-4 border-transparent"
                }`}
              >
                <span className="mt-0.5 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-sm">
                  {NOTIF_ICONS[n.type] || <FaBell className="text-slate-400" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${n.isRead ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-white"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Bottom Tables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FaBullhorn className="w-4 h-4 text-blue-500" />
              <h2 className="font-bold text-slate-800 dark:text-white">Recent Announcements</h2>
            </div>
            <Link to="/student/announcements" className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
              View all <FaChevronRight className="w-2.5 h-2.5" />
            </Link>
          </div>
          {!stats.recentAnnouncements?.length ? (
            <p className="text-center text-slate-400 text-sm py-6">No recent announcements</p>
          ) : (
            <div className="space-y-3">
              {stats.recentAnnouncements.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <FaBullhorn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Mess Leaves */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FaUtensils className="w-4 h-4 text-orange-500" />
              <h2 className="font-bold text-slate-800 dark:text-white">Approved Mess Leaves</h2>
            </div>
            <Link to="/student/mess-leaves" className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
              View all <FaChevronRight className="w-2.5 h-2.5" />
            </Link>
          </div>
          {!stats.recentMessLeaves?.length ? (
            <p className="text-center text-slate-400 text-sm py-6">No approved mess leaves</p>
          ) : (
            <div className="space-y-3">
              {stats.recentMessLeaves.map((item, idx) => {
                const start = new Date(item.startDate);
                const end = new Date(item.endDate);
                const days = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{days}d</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {start.toLocaleDateString()} → {end.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.reason}</p>
                    </div>
                    <FaCircleCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;