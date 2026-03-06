import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getAllStudents,
  approveStudent,
  rejectStudent,
} from "../../api/user.api";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/apiError";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { Search, X, Trash2 } from "lucide-react";

const BRANCHES = [
  "CSE", "ECE", "EEE", "MECH", "CIVIL", "METALLURGY", "MINING", "CHEMICAL",
];

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // ─── Search & filter state ────────────────────────────
  const [query, setQuery] = useState("");           // name or student ID
  const [branchFilter, setBranchFilter] = useState("");
  const [blockFilter, setBlockFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, requestsRes] = await Promise.all([
        getAllStudents(),
        api.get("/admin/registrations"),
      ]);
      setStudents(studentsRes.data?.students || studentsRes.data || []);
      setRequests(requestsRes.data.requests || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load students data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await approveStudent(requestId);
      toast.success("Student approved");
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Approval failed"));
    }
  };

  const handleReject = async (requestId) => {
    try {
      await rejectStudent(requestId);
      toast.success("Student rejected");
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Rejection failed"));
    }
  };

  const handleDelete = async (studentId, fullName) => {
    if (!window.confirm(`Delete ${fullName}?\n\nThis will permanently remove the student and ALL their records (attendance, complaints, invoices, mess leaves, bookings).`)) return;
    try {
      await api.delete(`/admin/students/${studentId}`);
      toast.success(`${fullName} deleted`);
      setStudents((prev) => prev.filter((s) => s._id !== studentId));
    } catch (error) {
      toast.error(getErrorMessage(error, "Delete failed"));
    }
  };

  // ─── Client-side filtering ────────────────────────────
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        s.fullName?.toLowerCase().includes(q) ||
        s.studentID?.toLowerCase().includes(q) ||
        s.collegeEmail?.toLowerCase().includes(q);

      const matchesBranch = !branchFilter || s.branch === branchFilter;
      const matchesBlock  = !blockFilter  || s.hostelBlock === blockFilter;

      return matchesQuery && matchesBranch && matchesBlock;
    });
  }, [students, query, branchFilter, blockFilter]);

  const hasFilters = query || branchFilter || blockFilter;

  const clearFilters = () => {
    setQuery("");
    setBranchFilter("");
    setBlockFilter("");
  };

  // Derive unique hostel blocks from the data (admin sees only their block anyway, but future-proof)
  const hostelBlocks = [...new Set(students.map((s) => s.hostelBlock).filter(Boolean))].sort();

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">
        Manage Students
      </h1>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* ================= Pending Requests ================= */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-8 border border-slate-200 dark:border-slate-700 w-full">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
              Pending Registration Requests ({requests.length})
            </h2>

            {requests.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 text-lg">No pending registration requests</p>
                <p className="text-sm text-slate-400">New student registrations will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="p-4">Name</th>
                      <th className="p-4">Student ID</th>
                      <th className="p-4">Branch</th>
                      <th className="p-4">Room</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {requests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <span className="font-medium text-slate-900 dark:text-white block text-base">{req.fullName}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{req.collegeEmail}</span>
                        </td>
                        <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{req.studentID}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{req.branch}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {req.hostelBlock} - <span className="font-semibold text-slate-800 dark:text-slate-200">{req.roomNO}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApprove(req._id)}
                              className="px-4 py-2 rounded-lg text-sm font-semibold transition bg-green-600 text-white hover:bg-green-700 shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(req._id)}
                              className="px-4 py-2 rounded-lg text-sm font-semibold transition bg-red-600 text-white hover:bg-red-700 shadow-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ================= Approved Students ================= */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Approved Students ({filteredStudents.length}
                {hasFilters && students.length !== filteredStudents.length && (
                  <span className="text-sm font-normal text-slate-400"> of {students.length}</span>
                )})
              </h2>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              )}
            </div>

            {/* ── Search + Filter bar ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID or email…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Branch filter */}
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">All Branches</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* Block filter — only shown if there's more than one block */}
              {hostelBlocks.length > 1 && (
                <select
                  value={blockFilter}
                  onChange={(e) => setBlockFilter(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="">All Blocks</option>
                  {hostelBlocks.map((b) => (
                    <option key={b} value={b}>Block {b}</option>
                  ))}
                </select>
              )}
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  {hasFilters ? "No students match your filters" : "No approved students yet"}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="mt-2 text-sm text-blue-500 hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="p-4">Name</th>
                      <th className="p-4">Student ID</th>
                      <th className="p-4">Branch</th>
                      <th className="p-4">Room</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                              {student.fullName?.charAt(0) || "S"}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white text-base">{student.fullName}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{student.studentID}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {student.branch}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          Block {student.hostelBlock} — <span className="font-semibold text-slate-800 dark:text-slate-200">{student.roomNO}</span>
                        </td>
                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{student.collegeEmail}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDelete(student._id, student.fullName)}
                            className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default ManageStudents;
