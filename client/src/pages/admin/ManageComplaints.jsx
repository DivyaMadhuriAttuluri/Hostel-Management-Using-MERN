import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAllComplaints, updateComplaintStatus } from "../../api/complaint.api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaBolt, FaDroplet, FaUtensils, FaFan, FaLightbulb, FaCircleDot,
  FaCircleCheck, FaClock, FaCircleExclamation, FaCircleUser,
  FaFilter, FaArrowsRotate,
} from "react-icons/fa6";

const CATEGORIES = {
  electricity: { icon: FaBolt,    color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" },
  water:       { icon: FaDroplet, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
  mess:        { icon: FaUtensils,color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
  fans:        { icon: FaFan,     color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20" },
  lightbulb:   { icon: FaLightbulb, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
  other:       { icon: FaCircleDot,  color: "text-slate-500 bg-slate-100 dark:bg-slate-800" },
};

const STATUS_CONFIG = {
  pending:  { icon: FaClock,             label: "Pending",     color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400" },
  accepted: { icon: FaCircleExclamation, label: "In Progress", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" },
  resolved: { icon: FaCircleCheck,       label: "Resolved",    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" },
};

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [resolutionNotes, setResolutionNotes] = useState({});

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await getAllComplaints();
      setComplaints(data.complaints || data || []);
    } catch {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const updateStatus = async (id, status) => {
    try {
      const note = resolutionNotes[id] || "";
      await updateComplaintStatus(id, status, note);
      toast.success(`Complaint marked as ${status}`);
      fetchComplaints();
    } catch {
      toast.error("Could not update status");
    }
  };

  const filtered = filterStatus === "all" ? complaints : complaints.filter(c => c.status === filterStatus);

  const counts = {
    all: complaints.length,
    pending: complaints.filter(c => c.status === "pending").length,
    accepted: complaints.filter(c => c.status === "accepted").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Complaints</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{complaints.length} total complaints in your block</p>
        </div>
        <button onClick={fetchComplaints} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors shadow-sm">
          <FaArrowsRotate className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { key: "all",      label: "All" },
          { key: "pending",  label: "Pending" },
          { key: "accepted", label: "In Progress" },
          { key: "resolved", label: "Resolved" },
        ].map(({ key, label }) => {
          const cfg = key === "all" ? null : STATUS_CONFIG[key];
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                filterStatus === key
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-300"
              }`}
            >
              {cfg && <cfg.icon className="w-3.5 h-3.5" />}
              {label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filterStatus === key ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}>
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
          No complaints found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(c => {
            const cat = CATEGORIES[c.category] || CATEGORIES.other;
            const CatIcon = cat.icon;
            const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
            const StIcon = st.icon;

            return (
              <div key={c._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col">
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider capitalize">{c.category}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${st.color}`}>
                          <StIcon className="w-3 h-3" />
                          {st.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug line-clamp-3">{c.description}</p>
                    </div>
                  </div>
                </div>

                {/* Student Info */}
                <div className="px-5 py-3 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {c.student?.fullName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{c.student?.fullName || "Unknown"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {c.student?.roomNO ? `Room ${c.student.roomNO}` : "No Room"} · ID: {c.student?.studentID || "—"}
                    </p>
                  </div>
                  <p className="ml-auto text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>

                {/* Actions */}
                {c.status !== "resolved" && (
                  <div className="p-4 space-y-3">
                    {c.status === "resolved" ? null : (
                      <textarea
                        placeholder="Add resolution note (optional)..."
                        value={resolutionNotes[c._id] || ""}
                        onChange={e => setResolutionNotes(prev => ({ ...prev, [c._id]: e.target.value }))}
                        rows={2}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    )}
                    <div className="flex gap-2">
                      {c.status === "pending" && (
                        <button
                          onClick={() => updateStatus(c._id, "accepted")}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          Accept
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(c._id, "resolved")}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                      >
                        Mark Resolved
                      </button>
                    </div>
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

export default ManageComplaints;
