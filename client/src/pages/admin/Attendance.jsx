import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAllStudents, markAttendance, getAttendanceByDate } from "../../api/admin.api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaCalendarDays, FaCircleCheck, FaCircleXmark, FaUsers,
  FaCircle, FaArrowsRotate,
} from "react-icons/fa6";

const AdminAttendance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [saving, setSaving] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: studentData } = await getAllStudents();
      let studentList = [];
      if (studentData.success) {
        studentList = studentData.students;
        setStudents(studentList);
      }
      if (selectedDate && studentList.length > 0) {
        try {
          const { data: attendanceData } = await getAttendanceByDate(selectedDate);
          if (attendanceData.success) {
            const statusMap = {};
            attendanceData.attendance.forEach(record => {
              if (record.student?.studentID) {
                statusMap[record.student.studentID] = record.status;
              }
            });
            setAttendanceStatus(statusMap);
          }
        } catch (err) {
          console.error("Failed to fetch attendance for date", err);
        }
      }
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDate]);

  const handleMarkAttendance = async (studentID, status) => {
    setSaving(prev => ({ ...prev, [studentID]: true }));
    try {
      await markAttendance({ studentID, date: selectedDate, status });
      setAttendanceStatus(prev => ({ ...prev, [studentID]: status }));
      toast.success(`Marked ${status}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    } finally {
      setSaving(prev => ({ ...prev, [studentID]: false }));
    }
  };

  const filteredAndSortedStudents = [...students]
    .filter((student) => student.studentID.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a.roomNO || "").localeCompare(b.roomNO || "", undefined, { numeric: true, sensitivity: 'base' }));

  const markedCount = Object.values(attendanceStatus).length;
  const presentCount = Object.values(attendanceStatus).filter(s => s === "present").length;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mark Attendance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {markedCount}/{students.length} marked · {presentCount} present
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <FaCalendarDays className="text-blue-500 w-4 h-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-white focus:outline-none text-sm"
            />
          </div>
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-sm transition-colors">
            <FaArrowsRotate className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
        <input 
          type="text" 
          placeholder="Search by Student ID (Roll No)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-slate-800 dark:text-white focus:outline-none text-sm placeholder-slate-400"
        />
      </div>

      {/* Summary Bar */}
      {students.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <FaUsers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{students.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <FaCircleCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Present</p>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{presentCount}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <FaCircleXmark className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Absent</p>
              <p className="text-2xl font-extrabold text-red-700 dark:text-red-400">
                {Object.values(attendanceStatus).filter(s => s === "absent").length}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? <Loader /> : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Mark</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-12 text-slate-400">No students in your block.</td></tr>
                ) : filteredAndSortedStudents.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-12 text-slate-400">No matching student found.</td></tr>
                ) : 
                  filteredAndSortedStudents.map((student, i) => {
                    const status = attendanceStatus[student.studentID];
                    return (
                      <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3.5 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {student.fullName?.charAt(0) || "?"}
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-white text-sm">{student.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400 font-mono text-sm">{student.studentID}</td>
                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400 text-sm">{student.roomNO}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleMarkAttendance(student.studentID, "present")}
                            disabled={saving[student.studentID]}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              status === "present"
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700"
                            }`}
                          >
                            <FaCircleCheck className="w-3.5 h-3.5" />
                            P
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(student.studentID, "absent")}
                            disabled={saving[student.studentID]}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              status === "absent"
                                ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700"
                            }`}
                          >
                            <FaCircleXmark className="w-3.5 h-3.5" />
                            A
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        {saving[student.studentID] ? (
                          <span className="text-xs text-blue-400 animate-pulse">Saving…</span>
                        ) : status ? (
                          <span className={`text-xs font-bold uppercase px-2 py-1 rounded-lg ${
                            status === "present"
                              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                          }`}>
                            {status}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Not marked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminAttendance;
