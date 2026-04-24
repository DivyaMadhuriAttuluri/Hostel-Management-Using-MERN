import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { createComplaint, getMyComplaints } from "../../api/complaint.api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaBolt, FaDroplet, FaUtensils, FaFan, FaLightbulb, FaCircleDot,
  FaCircleExclamation, FaCircleCheck, FaClock, FaChevronDown,
  FaPlus, FaTriangleExclamation,
} from "react-icons/fa6";

const CATEGORIES = [
  { value: "electricity", label: "Electricity",  icon: FaBolt,    color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" },
  { value: "water",       label: "Water",        icon: FaDroplet, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
  { value: "mess",        label: "Mess",         icon: FaUtensils,color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
  { value: "fans",        label: "Fans",         icon: FaFan,     color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20" },
  { value: "lightbulb",  label: "Lightbulb",    icon: FaLightbulb,color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
  { value: "other",      label: "Other",        icon: FaCircleDot,color: "text-slate-500 bg-slate-100 dark:bg-slate-800" },
];

const STATUS_CONFIG = {
  pending:  { icon: FaClock,       color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",   label: "Pending" },
  accepted: { icon: FaCircleExclamation, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400", label: "In Progress" },
  resolved: { icon: FaCircleCheck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400", label: "Resolved" },
};

const getCategoryMeta = (value) =>
  CATEGORIES.find(c => c.value === value) || CATEGORIES[5];

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: "electricity", description: "" });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await getMyComplaints();
      setComplaints(data.complaints || data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) return toast.error("Please enter a description");
    setSubmitting(true);
    const t = toast.loading("Submitting complaint...");
    try {
      const response = await createComplaint(formData);
      if (response?.data?.success) {
        toast.success("Complaint submitted!", { id: t });
        setFormData({ category: "electricity", description: "" });
        setShowForm(false);
        fetchComplaints();
      } else {
        toast.error(response?.data?.message || "Failed", { id: t });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit", { id: t });
    } finally {
      setSubmitting(false);
    }
  };

  // Group by status
  const grouped = {
    pending:  complaints.filter(c => c.status === "pending"),
    accepted: complaints.filter(c => c.status === "accepted"),
    resolved: complaints.filter(c => c.status === "resolved"),
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Complaints</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {complaints.length} total complaint{complaints.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
        >
          <FaPlus className="w-4 h-4" />
          New Complaint
        </button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <FaTriangleExclamation className="text-orange-500 w-5 h-5" />
            Submit New Complaint
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Category grid */}
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Category</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
              {CATEGORIES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, category: value }))}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-medium ${
                    formData.category === value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {label}
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe your issue in detail — location, when it started, what you've observed..."
                rows={4}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm transition-all"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md disabled:opacity-60 hover:-translate-y-0.5 transition-all"
              >
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <Loader />
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <FaCircleExclamation className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No complaints submitted yet</p>
          <p className="text-sm text-slate-400 mt-1">Click "New Complaint" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {Object.entries(grouped).map(([status, items]) => {
            const cfg = STATUS_CONFIG[status];
            const StatusIcon = cfg.icon;
            return (
              <div key={status} className="flex flex-col">
                {/* Column header */}
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-3 ${cfg.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="font-bold text-sm">{cfg.label}</span>
                  <span className="ml-auto text-xs font-bold opacity-70">{items.length}</span>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      No {status} complaints
                    </div>
                  ) : (
                    items.map(c => {
                      const cat = getCategoryMeta(c.category);
                      const CatIcon = cat.icon;
                      return (
                        <div
                          key={c._id}
                          className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                              <CatIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{cat.label}</span>
                              <p className="text-sm font-medium text-slate-800 dark:text-white mt-0.5 leading-snug line-clamp-3">
                                {c.description}
                              </p>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                            Submitted {new Date(c.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      );
                    })
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

export default Complaints;
