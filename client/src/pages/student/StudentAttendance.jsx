import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../api/axios";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const { data } = await api.get("/attendance/my-attendance");
        const items = Array.isArray(data) ? data : data.attendance || [];
        setRecords(items);

        const total = items.length;
        const present = items.filter((r) => r.status === "present").length;
        const absent = total - present;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
        setStats({ total, present, absent, percentage });
      } catch (error) {
        toast.error("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">
        My Attendance
      </h1>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Days</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Present</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.present}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Absent</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.absent}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Percentage</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.percentage}%</p>
            </div>
          </div>

          {/* Attendance Progress Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Attendance Rate</span>
              <span className={`text-sm font-bold ${
                stats.percentage >= 75 ? "text-green-600" : stats.percentage >= 50 ? "text-yellow-600" : "text-red-600"
              }`}>
                {stats.percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${
                  stats.percentage >= 75 ? "bg-green-500" : stats.percentage >= 50 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
            {stats.percentage < 75 && (
              <p className="text-xs text-red-500 mt-2">
                ⚠️ Your attendance is below 75%. Please maintain regular attendance.
              </p>
            )}
          </div>

          {/* Records Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Records (Last 30 Days)</h2>
            </div>
            {records.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No attendance records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-xs uppercase text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-3">#</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Day</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => {
                      const d = new Date(r.date);
                      return (
                        <tr key={r._id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-3 text-slate-500">{i + 1}</td>
                          <td className="px-6 py-3 font-medium text-slate-800 dark:text-white">
                            {d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                            {d.toLocaleDateString("en-US", { weekday: "long" })}
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              r.status === "present"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default StudentAttendance;
