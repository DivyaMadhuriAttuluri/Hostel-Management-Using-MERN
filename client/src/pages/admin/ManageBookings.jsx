import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAllBookings, updateBookingStatus } from "../../api/booking.api";
import { getErrorMessage } from "../../utils/apiError";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaBed, FaArrowsRotate, FaCircleCheck, FaCircleXmark, FaClock,
  FaCalendarDays, FaUserGroup,
} from "react-icons/fa6";

const STATUS_CONFIG = {
  pending:  { icon: FaClock,       color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",       label: "Pending" },
  approved: { icon: FaCircleCheck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400", label: "Approved" },
  rejected: { icon: FaCircleXmark, color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",                label: "Rejected" },
};

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await getAllBookings();
      setBookings(data.bookings || data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch bookings"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update booking"));
    }
  };

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    approved: bookings.filter(b => b.status === "approved").length,
    rejected: bookings.filter(b => b.status === "rejected").length,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Guest Room Bookings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{bookings.length} total bookings</p>
        </div>
        <button onClick={fetchBookings} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-sm transition-colors">
          <FaArrowsRotate className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "pending", "approved", "rejected"].map(f => {
          const cfg = f === "all" ? null : STATUS_CONFIG[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-300"
              }`}
            >
              {cfg && <cfg.icon className="w-3.5 h-3.5" />}
              {f === "all" ? "All" : STATUS_CONFIG[f].label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? <Loader />
        : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
            No bookings found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(booking => {
              const st = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const StIcon = st.icon;
              return (
                <div key={booking._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                  {/* color bar */}
                  <div className={`h-1 ${booking.status === "approved" ? "bg-emerald-500" : booking.status === "rejected" ? "bg-red-500" : "bg-amber-400"}`} />

                  <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                          <FaBed className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room</p>
                          <p className="text-base font-extrabold text-slate-800 dark:text-white">{booking.guestRoomNO}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg ${st.color}`}>
                        <StIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </div>

                    {/* Student info */}
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 mb-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {booking.student?.fullName?.charAt(0) || "?"}
                      </div>
                      <span className="font-semibold truncate">{booking.student?.fullName}</span>
                    </div>

                    {/* Visitor */}
                    <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                      <FaUserGroup className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{booking.visitorName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{booking.relation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-3">
                    {/* Dates */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <FaCalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(booking.dateFrom).toLocaleDateString()} → {new Date(booking.dateTo).toLocaleDateString()}
                    </div>

                    {booking.status === "pending" && (
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => handleStatusUpdate(booking._id, "approved")}
                          className="flex-1 py-2 rounded-xl text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, "rejected")}
                          className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </DashboardLayout>
  );
};

export default ManageBookings;