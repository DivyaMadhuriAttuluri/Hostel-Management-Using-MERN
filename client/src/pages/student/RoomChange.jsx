import { useEffect, useState, useContext } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { AuthContext } from "../../context/AuthProvider";
import { createRoomChangeRequest, getMyRoomChangeRequests } from "../../api/roomChange.api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaArrowRightArrowLeft, FaPlus, FaDoorClosed, FaCircleCheck,
  FaCircleXmark, FaClock, FaBuilding,
} from "react-icons/fa6";

const STATUS_CONFIG = {
  pending:  { icon: FaClock,       color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",     label: "Pending" },
  approved: { icon: FaCircleCheck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400", label: "Approved" },
  rejected: { icon: FaCircleXmark, color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",             label: "Rejected" },
};

const RoomChange = () => {
  const { authUser } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ requestedRoomNO: "", reason: "" });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await getMyRoomChangeRequests();
      setRequests(data.requests || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.requestedRoomNO || !formData.reason.trim())
      return toast.error("Please fill all fields");

    const t = toast.loading("Submitting request...");
    try {
      const { data } = await createRoomChangeRequest(formData);
      toast.success(data.message || "Request submitted!", { id: t });
      setFormData({ requestedRoomNO: "", reason: "" });
      setShowForm(false);
      fetchRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit", { id: t });
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <FaArrowRightArrowLeft className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Room Change</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Current: <span className="font-semibold text-slate-700 dark:text-slate-200">Block {authUser?.hostelBlock} — Room {authUser?.roomNO}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all"
        >
          <FaPlus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <FaArrowRightArrowLeft className="text-cyan-500 w-4 h-4" />
            Request Room Change
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Requested Room <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaDoorClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.requestedRoomNO}
                  onChange={e => setFormData(p => ({ ...p, requestedRoomNO: e.target.value }))}
                  placeholder="e.g. G-15, F-22"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Reason <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))}
                placeholder="Why do you want to change rooms?"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-all">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Request History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-800 dark:text-white">Request History</h2>
        </div>

        {loading ? <div className="p-8"><Loader /></div>
          : requests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FaArrowRightArrowLeft className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p>No room change requests yet</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map(r => {
                const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                const StIcon = st.icon;
                return (
                  <div key={r._id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl ${st.color}`}>
                        <StIcon className="w-3.5 h-3.5" />
                        {st.label}
                      </span>
                      <span className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg">
                        <FaBuilding className="w-3.5 h-3.5 text-slate-500" />
                        {r.currentRoomNO}
                      </div>
                      <FaArrowRightArrowLeft className="w-4 h-4 text-slate-400" />
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg">
                        <FaDoorClosed className="w-3.5 h-3.5" />
                        {r.requestedRoomNO}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Reason:</span> {r.reason}
                    </p>
                    {r.adminRemarks && (
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                        <span className="font-semibold">Admin:</span> {r.adminRemarks}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </DashboardLayout>
  );
};

export default RoomChange;
