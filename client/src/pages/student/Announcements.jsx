import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getMyAnnouncements } from "../../api/announcement.api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { FaBullhorn, FaArrowsRotate } from "react-icons/fa6";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await getMyAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <FaBullhorn className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Announcements</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{announcements.length} announcement{announcements.length !== 1 ? "s" : ""} from your admin</p>
          </div>
        </div>
        <button onClick={fetchAnnouncements} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-sm transition-colors">
          <FaArrowsRotate className="w-4 h-4" />
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <FaBullhorn className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 text-lg font-medium">No announcements yet</p>
          <p className="text-slate-400 text-sm mt-1">Check back later for updates from your hostel admin</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a, i) => (
            <div
              key={a._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              <div className="flex items-start gap-4 p-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <FaBullhorn className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-800 dark:text-white leading-snug">{a.title}</h3>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 mt-1">
                      {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {a.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Announcements;
