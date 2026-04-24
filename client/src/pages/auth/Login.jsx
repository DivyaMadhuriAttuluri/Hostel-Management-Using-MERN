import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import Loader from "../../components/common/Loader";
import {
  FaBuilding, FaClipboardCheck, FaUtensils, FaFileInvoiceDollar,
  FaEye, FaEyeSlash, FaUser, FaLock, FaGoogle, FaShieldAlt,
  FaArrowRight
} from "react-icons/fa";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: FaClipboardCheck, text: "Track attendance & mess leaves" },
  { icon: FaUtensils,       text: "View weekly mess menu" },
  { icon: FaFileInvoiceDollar, text: "Manage invoices & billing" },
  { icon: FaShieldAlt,     text: "Complaint tracking & resolution" },
];

const Login = () => {
  const { studentLogin, adminLogin, loading } = useContext(AuthContext);
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ studentID: "", adminID: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role === "student") {
      await studentLogin({ studentID: formData.studentID, password: formData.password });
    } else {
      await adminLogin({ adminID: formData.adminID, password: formData.password });
    }
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* ─── Left panel (hidden on mobile) ─── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <FaBuilding className="text-white w-6 h-6" />
          </div>
          <span className="text-white font-bold text-2xl">VNIT Hostel Portal</span>
        </div>

        {/* Hero text */}
        <div className="relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-white leading-tight mb-4"
          >
            Your complete hostel management solution
          </motion.h2>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed">
            Everything from room bookings to mess management — managed digitally, effortlessly.
          </p>

          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <f.icon className="text-white w-4 h-4" />
                </div>
                <span className="text-blue-100 text-sm">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-blue-200/60 text-xs relative">
          © {new Date().getFullYear()} VNIT Hostel Portal. All rights reserved.
        </p>
      </div>

      {/* ─── Right panel (form) ─── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <FaBuilding className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">VNIT Hostel Portal</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
              {role === "student" ? "Student Login" : "Admin Login"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              Sign in to access your hostel portal
            </p>

            {/* Role Toggle */}
            <div className="flex gap-1.5 mb-8 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              {["student", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={loading}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all duration-300 ${
                    role === r
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {r === "student" ? "🎓 Student" : "🛡️ Admin"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ID field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {role === "student" ? "Student ID" : "Admin ID"}
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name={role === "student" ? "studentID" : "adminID"}
                    value={role === "student" ? formData.studentID : formData.adminID}
                    onChange={handleChange}
                    placeholder={role === "student" ? "Enter your student ID" : "Enter your admin ID"}
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader />
                ) : (
                  <>
                    Sign In
                    <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Google OAuth — students only */}
              {role === "student" && (
                <>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => (window.location.href = "http://localhost:5000/api/auth/google")}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                  >
                    <FaGoogle className="w-4 h-4 text-red-500" />
                    Sign in with Google
                  </button>
                </>
              )}
            </form>

            {/* Bottom links */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2 text-center text-sm">
              <p className="text-slate-500 dark:text-slate-400">
                New student?{" "}
                <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  Create an account
                </Link>
              </p>
              <Link to="/registration-status" className="block text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                Check registration status
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
