import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { applyMessLeave, getMyMessLeaves } from "../../api/messLeave.api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaUtensils, FaPlus, FaCalendarDays, FaCircleCheck,
  FaCircleXmark, FaClock,
} from "react-icons/fa6";

const STATUS_CONFIG = {
  pending:  { icon: FaClock,       color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",       label: "Pending" },
  approved: { icon: FaCircleCheck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400", label: "Approved" },
  rejected: { icon: FaCircleXmark, color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",                label: "Rejected" },
};

const MessLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ startDate: "", endDate: "", reason: "" });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await getMyMessLeaves();
      setLeaves(data.leaves || data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load mess leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason.trim())
      return toast.error("Please fill all required fields");
    if (new Date(formData.endDate) < new Date(formData.startDate))
      return toast.error("End date must be after start date");

    const t = toast.loading("Submitting mess leave request...");
    try {
      const response = await applyMessLeave(formData);
      if (response?.data?.success) {
        toast.success("Mess leave applied successfully!", { id: t });
        setFormData({ startDate: "", endDate: "", reason: "" });
        setShowForm(false);
        fetchLeaves();
      } else {
        toast.error(response?.data?.message || "Failed to apply", { id: t });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to apply mess leave", { id: t });
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
            <FaUtensils className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mess Leaves</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{leaves.length} total request{leaves.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 transition-all"
        >
          <FaPlus className="w-4 h-4" />
          Apply Leave
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5">Apply for Mess Leave</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))}
                placeholder="Why do you need mess leave?"
                rows={3}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-all">
                Apply Leave
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave History */}
      {loading ? <Loader /> : leaves.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <FaUtensils className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 text-lg font-medium">No mess leave records yet</p>
          <p className="text-sm text-slate-400 mt-1">Click "Apply Leave" to submit a new request</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaves.map(l => {
            const st = STATUS_CONFIG[l.status] || STATUS_CONFIG.pending;
            const StIcon = st.icon;
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            const days = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

            return (
              <div key={l._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl ${st.color}`}>
                    <StIcon className="w-3.5 h-3.5" />
                    {st.label}
                  </span>
                  <div className="text-center">
                    <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{days}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block leading-none">days</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 mb-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <FaCalendarDays className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>{start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                  <span className="text-slate-400 mx-1">→</span>
                  <span>{end.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Reason: </span>
                  {l.reason}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MessLeaves;
