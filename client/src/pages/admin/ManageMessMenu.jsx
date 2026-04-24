import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getMessMenu, upsertMessMenu, deleteMessMenuEntry } from "../../api/messMenu.api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaClipboardList, FaPencil, FaTrash, FaMugHot,
  FaBowlFood, FaCookie, FaMoon, FaCircleCheck,
} from "react-icons/fa6";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MEAL_FIELDS = [
  { key: "breakfast", label: "Breakfast", icon: FaMugHot,    required: true,  color: "text-amber-500" },
  { key: "lunch",     label: "Lunch",     icon: FaBowlFood,  required: true,  color: "text-emerald-500" },
  { key: "snacks",    label: "Snacks",    icon: FaCookie,    required: false, color: "text-orange-500" },
  { key: "dinner",    label: "Dinner",    icon: FaMoon,      required: true,  color: "text-indigo-500" },
];

const ManageMessMenu = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState(null);
  const [formData, setFormData] = useState({ day: "", breakfast: "", lunch: "", snacks: "", dinner: "" });

  const fetchMenu = async () => {
    try {
      const { data } = await getMessMenu("");
      setMenu(data.menu || []);
    } catch {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenu(); }, []);

  const handleEdit = (day) => {
    const entry = menu.find(m => m.day === day);
    setEditingDay(day);
    setFormData({ day, breakfast: entry?.breakfast || "", lunch: entry?.lunch || "", snacks: entry?.snacks || "", dinner: entry?.dinner || "" });
  };

  const handleSave = async () => {
    if (!formData.breakfast || !formData.lunch || !formData.dinner)
      return toast.error("Breakfast, lunch, and dinner are required");

    const t = toast.loading("Saving...");
    try {
      await upsertMessMenu(formData);
      toast.success(`Menu for ${formData.day} saved!`, { id: t });
      setEditingDay(null);
      fetchMenu();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save", { id: t });
    }
  };

  const handleDelete = async (id, day) => {
    if (!confirm(`Delete menu for ${day}?`)) return;
    try {
      await deleteMessMenuEntry(id);
      toast.success("Menu entry deleted");
      fetchMenu();
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/25">
          <FaClipboardList className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Mess Menu</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{menu.length}/7 days configured</p>
        </div>
      </div>

      {/* Edit Panel */}
      {editingDay && (
        <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500 p-6 shadow-lg shadow-blue-500/10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FaPencil className="text-blue-500 w-4 h-4" />
              Edit — {editingDay}
            </h2>
            <button onClick={() => setEditingDay(null)}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {MEAL_FIELDS.map(({ key, label, icon: Icon, required, color }) => (
              <div key={key}>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <Icon className={`w-4 h-4 ${color}`} />
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={formData[key]}
                  onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={`Enter ${label}`}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave}
              className="inline-flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-all">
              <FaCircleCheck className="w-4 h-4" />
              Save Menu
            </button>
          </div>
        </div>
      )}

      {/* Day cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {DAYS.map(day => {
          const entry = menu.find(m => m.day === day);
          const isEditing = editingDay === day;
          return (
            <div key={day} className={`bg-white dark:bg-slate-900 rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${
              isEditing ? "border-blue-500 shadow-blue-500/20" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
            }`}>
              {/* Day header */}
              <div className={`px-3 py-2.5 text-xs font-bold text-center ${
                entry
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}>
                {day.slice(0, 3).toUpperCase()}
              </div>

              {/* Meal items */}
              <div className="p-3 space-y-1.5 text-[11px] min-h-[100px]">
                {entry ? (
                  MEAL_FIELDS.filter(f => entry[f.key]).map(({ key, icon: Icon, color }) => (
                    <div key={key} className="flex items-start gap-1.5">
                      <Icon className={`w-3 h-3 ${color} flex-shrink-0 mt-0.5`} />
                      <span className="text-slate-600 dark:text-slate-400 line-clamp-1">{entry[key]}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 py-4 italic text-center">
                    No menu set
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-3 pb-3 flex gap-2">
                <button
                  onClick={() => handleEdit(day)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                >
                  {entry ? "Edit" : "Add"}
                </button>
                {entry && (
                  <button
                    onClick={() => handleDelete(entry._id, day)}
                    className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default ManageMessMenu;
