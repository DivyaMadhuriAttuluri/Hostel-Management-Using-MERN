import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getMyInvoices } from "../../api/invoice.api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import {
  FaFileInvoiceDollar, FaCircleCheck, FaClock,
  FaIndianRupeeSign, FaCalendarDays, FaArrowsRotate,
} from "react-icons/fa6";

const MyInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data } = await getMyInvoices();
      setInvoices(data.invoices || data || []);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const filtered = filter === "all" ? invoices : invoices.filter(i => i.status === filter);

  const totalDue = invoices.filter(i => i.status === "pending")
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Invoices</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{invoices.length} total invoice{invoices.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={fetchInvoices} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-sm transition-colors">
          <FaArrowsRotate className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Bar */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <FaFileInvoiceDollar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Invoices</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{invoices.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <FaClock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{invoices.filter(i => i.status === "pending").length}</p>
            </div>
          </div>
          <div className={`rounded-2xl p-5 border shadow-sm flex items-center gap-4 ${
            totalDue > 0
              ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30"
              : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30"
          }`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              totalDue > 0 ? "bg-red-100 dark:bg-red-900/20" : "bg-emerald-100 dark:bg-emerald-900/20"
            }`}>
              <FaIndianRupeeSign className={`w-5 h-5 ${totalDue > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`} />
            </div>
            <div>
              <p className={`text-xs font-medium ${totalDue > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {totalDue > 0 ? "Amount Due" : "All Paid!"}
              </p>
              <p className={`text-2xl font-extrabold ${totalDue > 0 ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}>
                ₹{totalDue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {["all", "pending", "paid"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${
              filter === f
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-300"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <FaFileInvoiceDollar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 text-lg font-medium">No invoices here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(inv => (
            <div
              key={inv._id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col overflow-hidden ${
                inv.status === "paid"
                  ? "border-emerald-200 dark:border-emerald-900/30"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {/* Status bar */}
              <div className={`h-1 w-full ${inv.status === "paid" ? "bg-emerald-500" : "bg-amber-400"}`} />

              <div className="p-5 flex-1">
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Invoice</p>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">{inv.title}</h3>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl flex-shrink-0 ${
                    inv.status === "paid"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                  }`}>
                    {inv.status === "paid"
                      ? <><FaCircleCheck className="w-3 h-3" /> Paid</>
                      : <><FaClock className="w-3 h-3" /> Pending</>}
                  </span>
                </div>

                {/* Amount */}
                <div className="flex items-baseline gap-1 mb-3">
                  <FaIndianRupeeSign className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{(inv.amount || 0).toLocaleString()}</span>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{inv.description}</p>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <FaCalendarDays className="w-3.5 h-3.5" />
                  Due {new Date(inv.dueDate).toLocaleDateString()}
                </div>
                {inv.status === "pending" && (
                  <span className={`text-xs font-semibold ${
                    new Date(inv.dueDate) < new Date() ? "text-red-500" : "text-slate-500"
                  }`}>
                    {new Date(inv.dueDate) < new Date() ? "⚠ Overdue" : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyInvoices;
