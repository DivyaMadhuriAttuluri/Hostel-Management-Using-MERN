import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getMyBookings } from "../../api/booking.api";
import { getErrorMessage } from "../../utils/apiError";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaBed, FaArrowsRotate, FaCircleCheck, FaCircleXmark, FaClock,
  FaCalendarDays, FaUserGroup, FaHashtag,
} from "react-icons/fa6";

const STATUS_CONFIG = {
  pending:  { icon: FaClock,       color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",        label: "Pending" },
  approved: { icon: FaCircleCheck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",  label: "Approved" },
  rejected: { icon: FaCircleXmark, color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",                 label: "Rejected" },
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await getMyBookings();
      setBookings(data.bookings || data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch bookings"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <FaBed className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Bookings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{bookings.length} guest room booking{bookings.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button onClick={fetchBookings} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-sm transition-colors">
          <FaArrowsRotate className="w-4 h-4" />
        </button>
      </div>

      {loading ? <Loader />
        : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <FaBed className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 text-lg font-medium">No bookings yet</p>
            <p className="text-sm text-slate-400 mt-1">Use "Guest Room" to book a room for your visitor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookings.map(booking => {
              const st = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const StIcon = st.icon;
              return (
                <div key={booking._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
                >
                  {/* Top color bar */}
                  <div className={`h-1 ${booking.status === "approved" ? "bg-emerald-500" : booking.status === "rejected" ? "bg-red-500" : "bg-amber-400"}`} />

                  <div className="p-5">
                    {/* Room # and Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                          <FaHashtag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room</p>
                          <p className="text-base font-extrabold text-slate-800 dark:text-white">{booking.guestRoomNO}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl ${st.color}`}>
                        <StIcon className="w-3.5 h-3.5" />
                        {st.label}
                      </span>
                    </div>

                    {/* Visitor */}
                    <div className="flex items-start gap-3 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <FaUserGroup className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{booking.visitorName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{booking.relation}</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <FaCalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(booking.dateFrom).toLocaleDateString()}
                      <span className="text-slate-400">→</span>
                      {new Date(booking.dateTo).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </DashboardLayout>
  );
};

export default MyBookings;
