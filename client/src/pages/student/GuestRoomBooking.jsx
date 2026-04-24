import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getAvailableGuestRooms,
  createRoomBooking,
} from "../../api/booking.api";
import { getErrorMessage } from "../../utils/apiError";
import RoomCard from "../../components/booking/RoomCard";
import BookingForm from "../../components/booking/BookingForm";
import toast from "react-hot-toast";
import { FaBed, FaArrowsRotate } from "react-icons/fa6";

export const GuestRoomBooking = () => {
  const [allRooms, setAllRooms] = useState([]); // All rooms with status
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    visitorName: "",
    relation: "",
    guestRoomNO: "",
    dateFrom: "",
    dateTo: "",
    purpose: "",
  });

  /* =========================
     FETCH ALL ROOMS WITH STATUS
  ========================= */
  const fetchAllRooms = async () => {
    if (!formData.dateFrom || !formData.dateTo) {
      setAllRooms([]);
      return;
    }

    try {
      const { data } = await getAvailableGuestRooms({
        dateFrom: formData.dateFrom,
        dateTo: formData.dateTo,
      });
      
      // Use allRooms if available, otherwise fallback to availableRooms
      if (data.allRooms && data.allRooms.length > 0) {
        setAllRooms(data.allRooms);
      } else if (data.availableRooms) {
        // Fallback: create room objects from available room numbers
        const rooms = data.availableRooms.map(roomNo => ({
          roomNo: roomNo,
          status: "available"
        }));
        setAllRooms(rooms);
      } else {
        setAllRooms([]);
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to fetch rooms")
      );
    }
  };

  useEffect(() => {
    fetchAllRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.dateFrom, formData.dateTo]);

  // Poll for room status updates every 5 seconds when dates are selected
  useEffect(() => {
    if (!formData.dateFrom || !formData.dateTo) return;

    const interval = setInterval(() => {
      setRefreshing(true);
      fetchAllRooms().finally(() => setRefreshing(false));
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.dateFrom, formData.dateTo]);

  /* =========================
     FORM HANDLERS
  ========================= */
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoomSelect = (roomNo) => {
    // Only allow selection of available rooms
    const room = allRooms.find(r => r.roomNo === roomNo);
    if (room && room.status === "available") {
      setFormData((prev) => ({
        ...prev,
        guestRoomNO: roomNo,
      }));
    } else {
      toast.error("This room is not available for the selected dates");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.guestRoomNO) {
      toast.error("Please select a guest room");
      return;
    }

    if (!formData.visitorName || !formData.relation || !formData.dateFrom || !formData.dateTo) {
      toast.error("Please fill all required fields");
      return;
    }

    const submitToast = toast.loading("Submitting booking request...");
    setLoading(true);

    try {
      const response = await createRoomBooking(formData);
      toast.success("Guest room booking request submitted successfully!", { id: submitToast });

      setFormData({
        visitorName: "",
        relation: "",
        guestRoomNO: "",
        dateFrom: "",
        dateTo: "",
        purpose: "",
      });

      setAllRooms([]);
      fetchAllRooms(); // Refresh room status after booking
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Booking failed";
      toast.error(errorMessage, { id: submitToast });
      console.error("Booking error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Guest Room Booking</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Book accommodation for your visitors</p>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* ================= Rooms (Left Side - Wider) ================= */}
            <div className="xl:col-span-2 order-2 xl:order-1">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                Available Rooms
                                {refreshing && <span className="text-xs font-normal text-blue-500 animate-pulse">(Updating...)</span>}
                            </h2>
                            <p className="text-sm text-slate-500">Select a room from the grid below</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-xs font-medium">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                <span className="text-green-700 dark:text-green-400">Available</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50">
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                <span className="text-yellow-700 dark:text-yellow-400">Pending</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <span className="text-red-700 dark:text-red-400">Booked</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 flex-grow bg-slate-50/50 dark:bg-slate-900/50">
                        {!formData.dateFrom || !formData.dateTo ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                </div>
                                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">Select Dates First</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                    Please choose your check-in and check-out dates to see real-time room availability.
                                </p>
                            </div>
                        ) : allRooms.length === 0 ? (
                            <div className="h-full flex items-center justify-center p-12">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Loading availability...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-[600px] overflow-y-auto custom-scrollbar p-1">
                                {allRooms.map((room) => (
                                <RoomCard
                                    key={room.roomNo}
                                    room={room.roomNo}
                                    status={room.status}
                                    isSelected={formData.guestRoomNO === room.roomNo}
                                    onSelect={handleRoomSelect}
                                />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ================= Booking Form (Right Side) ================= */}
            <div className="xl:col-span-1 order-1 xl:order-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sticky top-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                        Booking Details
                    </h2>
                    <BookingForm
                        formData={formData}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GuestRoomBooking;
