import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getBlockRoomChangeRequests, updateRoomChangeStatus } from "../../api/roomChange.api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaArrowRightArrowLeft, FaCircleCheck, FaCircleXmark, FaClock,
  FaArrowsRotate, FaBuilding, FaDoorClosed,
} from "react-icons/fa6";

const STATUS_CONFIG = {
  pending:  { icon: FaClock,       color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",       label: "Pending" },
  approved: { icon: FaCircleCheck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400", label: "Approved" },
  rejected: { icon: FaCircleXmark, color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",                label: "Rejected" },
};

const ManageRoomChanges = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState({});
  const [filter, setFilter] = useState("all");

  const fetchRequests = async () => {
    try {
      const { data } = await getBlockRoomChangeRequests();
      setRequests(data.requests || []);
    } catch {
      toast.error("Failed to load room change requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, status) => {
    const t = toast.loading(`${status === "approved" ? "Approving" : "Rejecting"}...`);
    try {
      await updateRoomChangeStatus(id, { status, adminRemarks: remarks[id] || "" });
      toast.success(`Request ${status}!`, { id: t });
      fetchRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed", { id: t });
    }
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Room Change Requests</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{requests.length} total requests</p>
        </div>
        <button onClick={fetchRequests} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-sm transition-colors">
          <FaArrowsRotate className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "pending", "approved", "rejected"].map(f => {
          const cfg = f === "all" ? null : STATUS_CONFIG[f];
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-300"
              }`}>
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
            No room change requests
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(r => {
              const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
              const StIcon = st.icon;
              return (
                <div key={r._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                  {/* Header */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                          {r.student?.fullName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{r.student?.fullName}</p>
                          <p className="text-xs text-slate-500">ID: {r.student?.studentID}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg ${st.color}`}>
                        <StIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </div>

                    {/* Room arrow */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <FaBuilding className="w-3.5 h-3.5 text-slate-500" />
                        {r.currentRoomNO}
                      </div>
                      <FaArrowRightArrowLeft className="w-4 h-4 text-slate-400" />
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm font-semibold text-blue-700 dark:text-blue-400">
                        <FaDoorClosed className="w-3.5 h-3.5" />
                        {r.requestedRoomNO}
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Reason</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">{r.reason}</p>

                    {r.adminRemarks && (
                      <p className="text-xs text-slate-500 italic mb-3">
                        Admin note: {r.adminRemarks}
                      </p>
                    )}

                    {r.status === "pending" && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Add admin remarks (optional)"
                          value={remarks[r._id] || ""}
                          onChange={e => setRemarks(p => ({ ...p, [r._id]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-3">
                          <button onClick={() => handleAction(r._id, "approved")}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors">
                            Approve
                          </button>
                          <button onClick={() => handleAction(r._id, "rejected")}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 transition-colors">
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </DashboardLayout>
  );
};

export default ManageRoomChanges;
