import { useEffect, useState, useContext } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { AuthContext } from "../../context/AuthProvider";
import { getStudentDashboardStats } from "../../api/user.api";
import {
  getMyNotifications,
  markAllRead,
  markOneRead,
} from "../../api/notifications.api";
import Loader from "../../components/common/Loader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  CheckCircle,
  AlertCircle,
  Calendar,
  Megaphone,
  UtensilsCrossed,
  Bell,
  CheckCheck,
} from "lucide-react";

// Colors for Pie Chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const StudentDashboard = () => {
  const { authUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalAttendance: 0,
    activeComplaints: 0,
    messLeaveDays: 0,
    attendanceTrend: [],
    complaintsByCategory: [],
    recentAnnouncements: [],
    recentMessLeaves: []
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getStudentDashboardStats();
        if (data.success) setStats(data.stats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchNotifications = async () => {
      try {
        const { data } = await getMyNotifications();
        if (data.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch (e) {
        console.error("Failed to fetch notifications", e);
      }
    };
    fetchStats();
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleMarkOne = async (id) => {
    await markOneRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  if (loading) return <Loader />;

  // Transform attendance data for chart (0 for absent, 1 for present)
  // Or just plotting 'present' / 'absent' isn't numeric. 
  // Let's visualize counts or just a simple line if possible.
  // Actually, for "Trend", if it's daily status, dot plot is better.
  // But user asked for "Attendance Trend". 
  // Let's map 'present' -> 1, 'absent' -> 0 for visual line.
  const graphData = stats.attendanceTrend?.map(item => ({
    date: item.date,
    statusVal: item.status === 'present' ? 1 : 0,
    status: item.status
  })) || [];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
          Welcome, {authUser?.fullName}!
        </h1>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Attendance */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 opacity-80" />
            <h3 className="text-lg font-medium opacity-90">Total Attendance</h3>
          </div>
          <p className="text-4xl font-bold">{stats.totalAttendance || 0}</p>
        </div>

        {/* Active Complaints */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 opacity-80" />
            <h3 className="text-lg font-medium opacity-90">Active Complaints</h3>
          </div>
          <p className="text-4xl font-bold">{stats.activeComplaints || 0}</p>
        </div>

        {/* Mess Leave Days */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 opacity-80" />
            <h3 className="text-lg font-medium opacity-90">Mess Leave Days</h3>
          </div>
          <p className="text-4xl font-bold">{stats.messLeaveDays || 0}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attendance Trend Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Attendance Trend (Last 7 Days)</h2>
          </div>
          <div className="h-[300px]">
             {graphData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 1]} ticks={[0, 1]} tickFormatter={(val) => val === 1 ? 'P' : 'A'} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
                    />
                    <Line 
                        type="step" 
                        dataKey="statusVal" 
                        stroke="#8b5cf6" 
                        strokeWidth={3} 
                        dot={{ r: 6, fill: "#8b5cf6" }} 
                        name="Status"
                    />
                  </LineChart>
                </ResponsiveContainer>
             ) : (
                <p className="text-slate-400 text-center flex items-center justify-center h-full">No attendance data available</p>
             )}
          </div>
        </div>

        {/* Complaints Pie Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Complaints by Category</h2>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            {stats.complaintsByCategory?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.complaintsByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {stats.complaintsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                         contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="text-slate-400">No complaints data</div>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────
          NOTIFICATIONS PANEL
      ──────────────────────────────────────── */}
      <div className="mb-8 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm">No notifications yet</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <li
                key={n._id}
                onClick={() => !n.isRead && handleMarkOne(n._id)}
                className={`flex items-start gap-3 px-6 py-4 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  !n.isRead
                    ? "border-l-4 border-blue-500 bg-blue-50/30 dark:bg-blue-900/10"
                    : "border-l-4 border-transparent"
                }`}
              >
                {/* Icon by type */}
                <span className="mt-0.5 text-lg">
                  {n.type === "complaint" && "🔧"}
                  {n.type === "mess_leave" && "🍽️"}
                  {n.type === "booking" && "🏨"}
                  {n.type === "invoice" && "💸"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${
                    n.isRead ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-white"
                  }`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bottom Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Recent Announcements</h2>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <tr>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.recentAnnouncements?.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{item.title}</td>
                            <td className="px-4 py-3 truncate max-w-[150px]">{item.message}</td>
                            <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {(!stats.recentAnnouncements || stats.recentAnnouncements.length === 0) && (
                        <tr>
                            <td colSpan="3" className="px-4 py-6 text-center text-slate-500">No recent announcements</td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
        </div>

        {/* Mess Leaves List */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Approved Mess Leaves</h2>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <tr>
                        <th className="px-4 py-3">Start Date</th>
                        <th className="px-4 py-3">End Date</th>
                        <th className="px-4 py-3">Days</th>
                        <th className="px-4 py-3">Reason</th>
                    </tr>
                </thead>
                <tbody>
                   {stats.recentMessLeaves?.map((item, idx) => {
                       const start = new Date(item.startDate);
                       const end = new Date(item.endDate);
                       const diffTime = Math.abs(end - start);
                       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                       return (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-3">{start.toLocaleDateString()}</td>
                            <td className="px-4 py-3">{end.toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-center">{diffDays}</td>
                             <td className="px-4 py-3 truncate max-w-[100px]">{item.reason}</td>
                        </tr>
                       )
                   })}
                   {(!stats.recentMessLeaves || stats.recentMessLeaves.length === 0) && (
                        <tr>
                            <td colSpan="4" className="px-4 py-6 text-center text-slate-500">No approved mess leaves</td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;