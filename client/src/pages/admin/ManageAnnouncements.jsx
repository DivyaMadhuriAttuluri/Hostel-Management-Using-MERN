import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { createAnnouncement, getAllAnnouncements } from "../../api/announcement.api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { FaBullhorn, FaPlus, FaArrowsRotate } from "react-icons/fa6";

const ManageAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", message: "" });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await getAllAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim())
      return toast.error("Please fill all fields");

    const t = toast.loading("Publishing announcement...");
    setSubmitting(true);
    try {
      const response = await createAnnouncement(formData);
      if (response?.data?.success) {
        toast.success("Announcement published!", { id: t });
        setFormData({ title: "", message: "" });
        setShowForm(false);
        fetchAnnouncements();
      } else {
        toast.error(response?.data?.message || "Failed", { id: t });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create announcement", { id: t });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Announcements</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{announcements.length} active announcement{announcements.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchAnnouncements} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-sm transition-colors">
            <FaArrowsRotate className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all"
          >
            <FaPlus className="w-4 h-4" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="mb-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <FaBullhorn className="text-blue-500 w-5 h-5" />
            Create Announcement
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="Enter a catchy title"
                disabled={submitting}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                placeholder="Type your announcement details here..."
                disabled={submitting}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm disabled:opacity-60"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md disabled:opacity-60 hover:-translate-y-0.5 transition-all">
                {submitting ? "Publishing..." : "Publish"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? <Loader />
        : announcements.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <FaBullhorn className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 text-lg font-medium">No announcements yet</p>
            <p className="text-sm text-slate-400 mt-1">Click "New Announcement" to publish your first one</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <FaBullhorn className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-base font-bold text-slate-800 dark:text-white leading-snug">{a.title}</h3>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 mt-1">
                        {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{a.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </DashboardLayout>
  );
};

export default ManageAnnouncements;
