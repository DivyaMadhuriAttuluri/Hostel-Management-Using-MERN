import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAllMessLeaves, updateMessLeaveStatus } from "../../api/messLeave.api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaUtensils, FaArrowsRotate, FaCalendarDays,
  FaCircleCheck, FaCircleXmark, FaClock,
} from "react-icons/fa6";

const STATUS_CONFIG = {
  pending:  { icon: FaClock,       color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",       label: "Pending" },
  approved: { icon: FaCircleCheck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400", label: "Approved" },
  rejected: { icon: FaCircleXmark, color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",                label: "Rejected" },
};

const ManageMessLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await getAllMessLeaves();
      setLeaves(data.leaves || data || []);
    } catch {
      toast.error("Failed to load mess leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await updateMessLeaveStatus(id, status);
      toast.success(`Leave ${status}`);
      fetchLeaves();
    } catch {
      toast.error("Could not update status");
    }
  };

  const filtered = filter === "all" ? leaves : leaves.filter(l => l.status === filter);
  const counts = {
    all: leaves.length,
    pending: leaves.filter(l => l.status === "pending").length,
    approved: leaves.filter(l => l.status === "approved").length,
    rejected: leaves.filter(l => l.status === "rejected").length,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mess Leave Requests</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{leaves.length} total requests in your block</p>
        </div>
        <button onClick={fetchLeaves} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-sm transition-colors">
          <FaArrowsRotate className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "pending", "approved", "rejected"].map(f => {
          const cfg = f === "all" ? null : STATUS_CONFIG[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${
                filter === f
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-300"
              }`}
            >
              {cfg && <cfg.icon className="w-3.5 h-3.5" />}
              {f === "all" ? "All" : STATUS_CONFIG[f].label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? <Loader />
        : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
            No {filter === "all" ? "" : filter} requests found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(l => {
              const st = STATUS_CONFIG[l.status] || STATUS_CONFIG.pending;
              const StIcon = st.icon;
              const start = new Date(l.startDate);
              const end = new Date(l.endDate);
              const days = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

              return (
                <div key={l._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col">
                  {/* Card header */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {l.student?.fullName?.charAt(0) || "S"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{l.student?.fullName || "Unknown"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">ID: {l.student?.studentID} · Room {l.student?.roomNO}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${st.color}`}>
                        <StIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2.5">
                      <FaCalendarDays className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} → {end.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span className="ml-auto text-xs font-bold text-orange-600 dark:text-orange-400">{days}d</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Reason</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{l.reason || "No reason provided"}</p>
                  </div>

                  {l.status === "pending" && (
                    <div className="px-5 pb-5 grid grid-cols-2 gap-3">
                      <button onClick={() => updateStatus(l._id, "approved")}
                        className="py-2.5 rounded-xl text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                        Approve
                      </button>
                      <button onClick={() => updateStatus(l._id, "rejected")}
                        className="py-2.5 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </DashboardLayout>
  );
};

export default ManageMessLeaves;
