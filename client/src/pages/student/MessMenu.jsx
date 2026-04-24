import { useEffect, useState, useContext } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { AuthContext } from "../../context/AuthProvider";
import { getMessMenu } from "../../api/messMenu.api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaMugHot, FaBowlFood, FaCookie, FaMoon,
  FaCalendarDay, FaClipboardList,
} from "react-icons/fa6";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MEALS = [
  { key: "breakfast", label: "Breakfast", icon: FaMugHot,    color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-900/15",   border: "border-amber-100 dark:border-amber-800/30" },
  { key: "lunch",     label: "Lunch",     icon: FaBowlFood,  color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/15", border: "border-emerald-100 dark:border-emerald-800/30" },
  { key: "snacks",    label: "Snacks",    icon: FaCookie,    color: "text-orange-500",  bg: "bg-orange-50 dark:bg-orange-900/15",  border: "border-orange-100 dark:border-orange-800/30" },
  { key: "dinner",    label: "Dinner",    icon: FaMoon,      color: "text-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-900/15",  border: "border-indigo-100 dark:border-indigo-800/30" },
];

const MessMenu = () => {
  const { authUser } = useContext(AuthContext);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await getMessMenu(authUser?.hostelBlock || "A");
        setMenu(data.menu || []);
      } catch {
        toast.error("Failed to load mess menu");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
    setSelectedDay(today);
  }, [authUser]);

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  const getEntry = (day) => menu.find(m => m.day === day);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
          <FaClipboardList className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mess Menu</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Weekly menu for Block {authUser?.hostelBlock} — Today is <span className="font-semibold text-slate-700 dark:text-slate-200">{today}</span>
          </p>
        </div>
      </div>

      {menu.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <FaClipboardList className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 text-lg font-medium">No mess menu available yet</p>
          <p className="text-slate-400 text-sm mt-1">The admin hasn't uploaded the menu for your block.</p>
        </div>
      ) : (
        <>
          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {DAYS.map(day => {
              const isSelected = selectedDay === day;
              const isToday = day === today;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                      : isToday
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  {day.slice(0, 3)}
                  {isToday && !isSelected && <span className="ml-1 text-[10px] font-bold">•</span>}
                </button>
              );
            })}
          </div>

          {/* Selected day detail view */}
          {selectedDay && (() => {
            const entry = getEntry(selectedDay);
            const isToday = selectedDay === today;
            return (
              <div className={`bg-white dark:bg-slate-900 rounded-2xl border-2 shadow-sm overflow-hidden mb-6 ${
                isToday ? "border-blue-500" : "border-slate-200 dark:border-slate-800"
              }`}>
                <div className={`px-6 py-4 flex items-center justify-between ${
                  isToday ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}>
                  <div className="flex items-center gap-2">
                    <FaCalendarDay className="w-4 h-4" />
                    <h2 className="font-bold text-lg">{selectedDay}</h2>
                  </div>
                  {isToday && <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">Today</span>}
                </div>

                {entry ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                    {MEALS.map(({ key, label, icon: Icon, color, bg, border }) => {
                      const meal = entry[key];
                      if (!meal && key === "snacks") return null;
                      return (
                        <div key={key} className="p-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${bg} mb-4`}>
                            <Icon className={`w-4 h-4 ${color}`} />
                            <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{label}</span>
                          </div>
                          <p className="text-slate-800 dark:text-white text-sm leading-relaxed">
                            {meal || <span className="text-slate-400 italic">Not specified</span>}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 text-sm">No menu set for this day</div>
                )}
              </div>
            );
          })()}

          {/* Full week grid */}
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-4">Full Week Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {DAYS.map(day => {
              const entry = getEntry(day);
              const isToday = day === today;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`text-left rounded-2xl border overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    isToday
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className={`px-3 py-2 text-xs font-bold flex items-center justify-between ${
                    isToday ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                    {day.slice(0, 3)}
                    {isToday && <span className="text-[9px] bg-white/20 px-1.5 rounded">Today</span>}
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 space-y-1.5 text-[11px]">
                    {entry ? (
                      <>
                        {entry.breakfast && <p className="text-slate-600 dark:text-slate-400 line-clamp-1"><span className="font-semibold text-amber-500">B:</span> {entry.breakfast}</p>}
                        {entry.lunch     && <p className="text-slate-600 dark:text-slate-400 line-clamp-1"><span className="font-semibold text-emerald-500">L:</span> {entry.lunch}</p>}
                        {entry.dinner    && <p className="text-slate-600 dark:text-slate-400 line-clamp-1"><span className="font-semibold text-indigo-500">D:</span> {entry.dinner}</p>}
                      </>
                    ) : (
                      <p className="text-slate-400 italic">No menu</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default MessMenu;
