import { useState } from "react";
import { Link } from "react-router-dom";
import { checkRegistrationStatus } from "../../api/auth.api";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

const RegistrationStatus = () => {
  const [formData, setFormData] = useState({ studentID: "", collegeEmail: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const { data } = await checkRegistrationStatus(formData);
      setResult(data);
    } catch (error) {
      const msg = error?.response?.data?.message || "Unable to check status";
      toast.error(msg);
      setResult({ success: false, status: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg w-full max-w-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Registration Status</h2>
            <p className="text-xs text-slate-500">Check your registration approval status</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Student ID"
            name="studentID"
            value={formData.studentID}
            onChange={(e) =>
              setFormData((p) => ({ ...p, studentID: e.target.value }))
            }
            placeholder="Enter your Student ID"
            disabled={loading}
            required
          />

          <Input
            label="College Email"
            type="email"
            name="collegeEmail"
            value={formData.collegeEmail}
            onChange={(e) =>
              setFormData((p) => ({ ...p, collegeEmail: e.target.value }))
            }
            placeholder="your.email@college.edu"
            disabled={loading}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 px-4 py-2.5 rounded-lg font-medium transition bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? <Loader /> : "Check Status"}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg border ${statusColor[result.status] || statusColor.error}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold uppercase">{result.status}</span>
              {result.status === "approved" && <span>✅</span>}
              {result.status === "pending" && <span>⏳</span>}
              {result.status === "rejected" && <span>❌</span>}
            </div>
            <p className="text-sm">{result.message}</p>
            {result.hostelBlock && (
              <p className="text-xs mt-2 opacity-80">
                Block: {result.hostelBlock} | Room: {result.roomNO}
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-between text-sm">
          <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">
            ← Login
          </Link>
          <Link to="/register" className="text-blue-500 hover:text-blue-400 font-medium">
            Register →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationStatus;
