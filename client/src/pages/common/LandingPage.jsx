import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { useTheme } from "../../context/ThemeContext";
import {
  FaSun, FaMoon, FaBuilding, FaClipboardCheck, FaWrench,
  FaUtensils, FaFileInvoiceDollar, FaBullhorn, FaBed,
  FaShieldAlt, FaBolt, FaArrowRight, FaGraduationCap,
  FaCheckCircle, FaStar
} from "react-icons/fa";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: FaBuilding,          title: "Room Management",      desc: "Room allocation, change requests, and guest room bookings with real-time availability tracking.",       color: "from-blue-500 to-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20",       text: "text-blue-600 dark:text-blue-400" },
  { icon: FaClipboardCheck,    title: "Attendance Tracking",  desc: "Digital attendance marking by wardens with automated reports and 7-day trend visualisation.",           color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
  { icon: FaWrench,            title: "Complaint System",     desc: "Category-based complaints (electricity, water, mess…) with status tracking and email notifications.",   color: "from-orange-500 to-amber-500", bg: "bg-orange-50 dark:bg-orange-900/20",   text: "text-orange-600 dark:text-orange-400" },
  { icon: FaUtensils,          title: "Mess Management",      desc: "Weekly menu display, mess leave applications with approval workflows and deduction tracking.",           color: "from-rose-500 to-pink-500",    bg: "bg-rose-50 dark:bg-rose-900/20",       text: "text-rose-600 dark:text-rose-400" },
  { icon: FaFileInvoiceDollar, title: "Invoice & Billing",    desc: "Individual and broadcast invoice generation with due-date reminders and payment status tracking.",       color: "from-violet-500 to-purple-500",bg: "bg-violet-50 dark:bg-violet-900/20",   text: "text-violet-600 dark:text-violet-400" },
  { icon: FaBullhorn,          title: "Announcements",        desc: "Block-wise announcements from wardens with an in-app push notification system.",                        color: "from-cyan-500 to-blue-400",    bg: "bg-cyan-50 dark:bg-cyan-900/20",       text: "text-cyan-600 dark:text-cyan-400" },
];

const STATS = [
  { icon: FaGraduationCap, label: "Students Managed",     value: "500+", },
  { icon: FaCheckCircle,   label: "Complaints Resolved",  value: "1,200+", },
  { icon: FaShieldAlt,     label: "Uptime Reliability",   value: "99.9%", },
  { icon: FaBolt,          label: "Avg. Response Time",   value: "<24h", },
];

const HOW_IT_WORKS = [
  { step: "01", icon: FaGraduationCap, title: "Register",     desc: "Fill in your student details and submit your registration request to the hostel admin." },
  { step: "02", icon: FaShieldAlt,     title: "Get Approved", desc: "Your hostel admin reviews your application and approves your account." },
  { step: "03", icon: FaBolt,          title: "Access Portal", desc: "Log in and access all services — room bookings, mess, complaints, invoices, and more." },
];

const LandingPage = () => {
  const { isAuthenticated, authUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate(authUser?.role === "admin" ? "/admin" : "/student", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FaBuilding className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              VNIT Hostel Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {theme === "dark"
                ? <FaSun className="w-5 h-5 text-yellow-400" />
                : <FaMoon className="w-5 h-5 text-slate-600" />}
            </button>
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Login
            </Link>
            <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pt-20 pb-28">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-8 border border-blue-100 dark:border-blue-800/50"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Digital Hostel Operations Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6 max-w-4xl mx-auto"
          >
            Smart Hostel
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"> Management </span>
            System
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Streamline every aspect of hostel life — from room bookings and attendance to mess management and billing — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
            >
              Get Started Free <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/registration-status"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-2xl font-semibold border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-0.5 transition-all shadow-sm"
            >
              Check Registration Status
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-slate-500 dark:text-slate-400"
          >
            {["No credit card required", "Student approval in minutes", "Dark mode included"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <FaCheckCircle className="w-4 h-4 text-green-500" /> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <Icon className="w-7 h-7 mx-auto mb-3 opacity-80" />
                <p className="text-4xl font-extrabold mb-1">{value}</p>
                <p className="text-blue-100 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Everything You Need</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            One platform to manage your entire hostel — no spreadsheets, no paper forms.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5`}>
                <f.icon className={`w-6 h-6 ${f.text}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Up & Running in Minutes</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-14 text-lg">Three simple steps to get access to all hostel services.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((s) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <s.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-slate-800 rounded-full text-xs font-bold text-blue-600 border-2 border-blue-600 flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <FaStar className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-10 text-lg max-w-xl mx-auto">
            Register now and wait for admin approval to access all hostel services — room bookings, mess, complaints, and more.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-lg">
              Student Registration <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/30">
              Admin Login
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <FaBuilding className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white">VNIT Hostel Portal</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Hostel Management System — Built with MERN Stack
          </p>
          <div className="flex items-center gap-5 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/registration-status" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Registration Status</Link>
            <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
