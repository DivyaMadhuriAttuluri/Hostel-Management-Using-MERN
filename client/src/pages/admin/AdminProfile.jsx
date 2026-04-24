import { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { AuthContext } from "../../context/AuthProvider";
import { getAdminProfile, updateAdminProfile } from "../../api/auth.api";
import { getErrorMessage } from "../../utils/apiError";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaPencil, FaXmark, FaFloppyDisk, FaShieldHalved,
  FaEnvelope, FaBuildingColumns, FaIdCard,
} from "react-icons/fa6";

const AdminProfile = () => {
  const { authUser, setAuthUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: "", email: "", adminID: "", hostelBlock: "" });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminProfile();
      setFormData({ name: data.admin.name, email: data.admin.email, adminID: data.admin.adminID, hostelBlock: data.admin.hostelBlock });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load profile"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateAdminProfile({ name: formData.name, email: formData.email });
      toast.success("Profile updated successfully");
      setAuthUser({ ...authUser, name: data.admin.name });
      setIsEditing(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Profile update failed"));
    } finally {
      setLoading(false);
    }
  };

  const initials = formData.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "AD";

  if (loading && !formData.name) return <DashboardLayout><Loader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your administrator account</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all">
            <FaPencil className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <button onClick={() => { setIsEditing(false); fetchProfile(); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            <FaXmark className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center text-center shadow-sm">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-purple-500/25 mb-4">
                {initials}
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{formData.name || "—"}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{formData.email}</p>
              <div className="flex gap-2 flex-wrap justify-center">
                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-full">
                  Administrator
                </span>
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full">
                  Block {formData.hostelBlock}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-5 pb-2 border-b border-slate-100 dark:border-slate-800">
                Account Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
                    <FaShieldHalved className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                    {isEditing ? (
                      <input name="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required
                        className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    ) : <p className="text-sm font-medium text-slate-800 dark:text-white">{formData.name}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
                    <FaEnvelope className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    {isEditing ? (
                      <input type="email" name="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required
                        className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    ) : <p className="text-sm font-medium text-slate-800 dark:text-white">{formData.email}</p>}
                  </div>
                </div>

                {/* Admin ID */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
                    <FaIdCard className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Admin ID</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white font-mono">{formData.adminID}</p>
                  </div>
                </div>

                {/* Block */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
                    <FaBuildingColumns className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Hostel Block</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">Block {formData.hostelBlock}</p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end mt-6">
                  <button type="submit" disabled={loading}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                    <FaFloppyDisk className="w-4 h-4" />
                    {loading ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default AdminProfile;
