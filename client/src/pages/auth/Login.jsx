import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";

const Login = () => {
  const { studentLogin, adminLogin, loading } = useContext(AuthContext);

  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    studentID: "",
    adminID: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ important

    if (role === "student") {
      await studentLogin({
        studentID: formData.studentID,
        password: formData.password,
      });
    } else {
      await adminLogin({
        adminID: formData.adminID,
        password: formData.password,
      });
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg w-full max-w-sm border border-slate-200 dark:border-slate-800"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800 dark:text-white">
          {role === "student" ? "Student Login" : "Admin Login"}
        </h2>

        {/* role toggle */}
        <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            type="button"
            disabled={loading}
            className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${
              role === "student"
                ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
            onClick={() => setRole("student")}
          >
            Student
          </button>

          <button
            type="button"
            disabled={loading}
            className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${
              role === "admin"
                ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>
        </div>

        {role === "student" ? (
          <Input
            label="Student ID"
            name="studentID"
            value={formData.studentID}
            onChange={handleChange}
            disabled={loading} // ✅
            required
          />
        ) : (
          <Input
            label="Admin ID"
            name="adminID"
            value={formData.adminID}
            onChange={handleChange}
            disabled={loading} // ✅
            required
          />
        )}

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading} // ✅
          required
        />

        <Button type="submit" disabled={loading} className="w-full mt-4">
          {loading ? <Loader /> : "Login"}
        </Button>

        {/* 🔐 Google OAuth — only for students */}
        {role === "student" && (
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              (window.location.href = "http://localhost:5000/api/auth/google")
            }
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        )}

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-400">New user? </span>
          <Link to="/register" className="text-blue-500 hover:text-blue-400 font-medium hover:underline">
            Create new account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
