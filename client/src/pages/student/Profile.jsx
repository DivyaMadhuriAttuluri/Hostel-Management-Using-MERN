import { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { AuthContext } from "../../context/AuthProvider";
import { getStudentProfile, updateStudentProfile } from "../../api/user.api";
import { getErrorMessage } from "../../utils/apiError";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaPencil, FaXmark, FaFloppyDisk, FaCircleUser,
  FaBuilding, FaDoorClosed, FaCodeBranch, FaEnvelope,
  FaDroplet, FaPhone, FaUserGroup,
} from "react-icons/fa6";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const FieldRow = ({ icon: Icon, label, value, children, editable }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
    <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-blue-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      {children || (
        <p className="text-sm font-medium text-slate-800 dark:text-white">{value || <span className="text-slate-400 italic">Not set</span>}</p>
      )}
    </div>
  </div>
);

const StudentProfile = () => {
  const { authUser, setAuthUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: "", branch: "", collegeEmail: "", hostelBlock: "",
    roomNO: "", parentName: "", parentPhone: "", bloodGroup: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await getStudentProfile();
      setFormData({
        fullName:    data.student.fullName,
        branch:      data.student.branch,
        collegeEmail: data.student.collegeEmail,
        hostelBlock: data.student.hostelBlock,
        roomNO:      data.student.roomNO,
        parentName:  data.student.parentName || "",
        parentPhone: data.student.parentPhone || "",
        bloodGroup:  data.student.bloodGroup || "",
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load profile"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateStudentProfile(formData);
      toast.success("Profile updated successfully");
      setAuthUser(data.student);
      setIsEditing(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Profile update failed"));
    } finally {
      setLoading(false);
    }
  };

  const initials = formData.fullName
    ? formData.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (loading && !formData.fullName) return <DashboardLayout><Loader /></DashboardLayout>;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">View and manage your personal information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all"
          >
            <FaPencil className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={() => { setIsEditing(false); fetchProfile(); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
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
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-blue-500/25 mb-4">
                {initials}
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{formData.fullName || "—"}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{formData.collegeEmail}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                  {formData.branch}
                </span>
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                  Block {formData.hostelBlock}
                </span>
                <span className="px-3 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-xs font-bold rounded-full">
                  Room {formData.roomNO}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldRow icon={FaCircleUser} label="Full Name">
                  {isEditing ? (
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{formData.fullName}</p>
                  )}
                </FieldRow>

                <FieldRow icon={FaCodeBranch} label="Branch">
                  {isEditing ? (
                    <input
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      required
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{formData.branch}</p>
                  )}
                </FieldRow>

                <FieldRow icon={FaEnvelope}   label="College Email"  value={formData.collegeEmail} />
                <FieldRow icon={FaDroplet}    label="Blood Group"    value={formData.bloodGroup} />
                <FieldRow icon={FaBuilding}   label="Hostel Block"   value={`Block ${formData.hostelBlock}`} />
                <FieldRow icon={FaDoorClosed} label="Room Number"    value={formData.roomNO} />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldRow icon={FaUserGroup} label="Parent / Guardian Name">
                  {isEditing ? (
                    <input
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{formData.parentName || <span className="text-slate-400 italic">Not set</span>}</p>
                  )}
                </FieldRow>

                <FieldRow icon={FaPhone} label="Parent Phone">
                  {isEditing ? (
                    <input
                      name="parentPhone"
                      type="tel"
                      value={formData.parentPhone}
                      onChange={handleChange}
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{formData.parentPhone || <span className="text-slate-400 italic">Not set</span>}</p>
                  )}
                </FieldRow>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-60"
                >
                  <FaFloppyDisk className="w-4 h-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default StudentProfile;
