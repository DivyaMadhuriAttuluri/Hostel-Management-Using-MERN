import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword, resetPasswordAPI } from "../../api/auth.api";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP, 3 = done
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Enter your college email");

    setLoading(true);
    try {
      const { data } = await forgotPassword({ collegeEmail: email });
      toast.success(data.message || "OTP sent to your email");
      setStep(2);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword)
      return toast.error("Enter OTP and new password");
    if (newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      const { data } = await resetPasswordAPI({
        collegeEmail: email,
        otp,
        newPassword,
      });
      toast.success(data.message || "Password reset successfully");
      setStep(3);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg w-full max-w-sm border border-slate-200 dark:border-slate-800">
        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Forgot Password</h2>
                <p className="text-xs text-slate-500">Enter your college email to receive an OTP</p>
              </div>
            </div>

            <Input
              label="College Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@college.edu"
              disabled={loading}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 px-4 py-2.5 rounded-lg font-medium transition bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? <Loader /> : "Send OTP"}
            </button>

            <div className="mt-4 text-center text-sm">
              <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">
                ← Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Enter OTP + New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Verify & Reset</h2>
                <p className="text-xs text-slate-500">OTP sent to {email}</p>
              </div>
            </div>

            <Input
              label="OTP Code"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              disabled={loading}
              required
            />

            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              disabled={loading}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 px-4 py-2.5 rounded-lg font-medium transition bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? <Loader /> : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Send OTP again
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Password Reset!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Your password has been successfully reset.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
