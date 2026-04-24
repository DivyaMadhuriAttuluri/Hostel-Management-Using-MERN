import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  sendChangePasswordOtp,
  verifyChangePasswordOtp,
} from "../../api/auth.api";
import { getErrorMessage } from "../../utils/apiError";
import toast from "react-hot-toast";
import { FaKey, FaEye, FaEyeSlash, FaCircleCheck } from "react-icons/fa6";

const PasswordField = ({ label, name, value, onChange, disabled }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required
          className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          {show ? (
            <FaEyeSlash className="w-4 h-4" />
          ) : (
            <FaEye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

const AdminChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword)
      return toast.error("New passwords do not match");
    if (formData.newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      const { data } = await sendChangePasswordOtp({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success(data.message || "OTP sent to your email");
      setStep(2);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      return toast.error("Please enter OTP");
    }

    setLoading(true);
    try {
      const { data } = await verifyChangePasswordOtp({ otp: otp.trim() });
      toast.success(data.message || "Password changed successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setOtp("");
      setStep(1);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to verify OTP"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Change Password
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Update your administrator account password
        </p>
      </div>

      <div className="max-w-lg">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <FaKey className="text-white w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Security Update
              </p>
              <p className="text-xs text-slate-500">
                {step === 1
                  ? "Step 1: Enter current/new password"
                  : "Step 2: Enter OTP sent to your email"}
              </p>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <PasswordField
                label="Current Password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                disabled={loading}
              />
              <PasswordField
                label="New Password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={loading}
              />
              <PasswordField
                label="Confirm New Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-60 hover:-translate-y-0.5 transition-all"
                >
                  <FaCircleCheck className="w-4 h-4" />
                  {loading ? "Sending OTP…" : "Send OTP"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  OTP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-60"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-60 hover:-translate-y-0.5 transition-all"
                >
                  <FaCircleCheck className="w-4 h-4" />
                  {loading ? "Verifying…" : "Verify OTP & Change Password"}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminChangePassword;
