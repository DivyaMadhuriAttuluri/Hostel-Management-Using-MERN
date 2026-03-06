import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { registerStudent } from "../../api/auth.api";
import { getErrorMessage } from "../../utils/apiError";
import toast from "react-hot-toast";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

// ─────────────────────────────────────────────
// Generate all 400 room numbers: G-1…G-100, F-1…F-100, S-1…S-100, T-1…T-100
// ─────────────────────────────────────────────
const FLOORS = [
  { prefix: "G", label: "Ground" },
  { prefix: "F", label: "First" },
  { prefix: "S", label: "Second" },
  { prefix: "T", label: "Third" },
];

const ALL_ROOMS = FLOORS.flatMap(({ prefix }) =>
  Array.from({ length: 100 }, (_, i) => `${prefix}-${i + 1}`)
);

// ─────────────────────────────────────────────
// RoomSearch — searchable combobox
// ─────────────────────────────────────────────
const RoomSearch = ({ value, onChange, disabled }) => {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Filter rooms: show only if query has content
  const filtered = query.trim()
    ? ALL_ROOMS.filter((r) =>
        r.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20) // cap at 20 visible options
    : [];

  // Sync query when parent clears form
  useEffect(() => {
    if (!value) setQuery("");
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectRoom = (room) => {
    setQuery(room);
    setOpen(false);
    onChange(room); // notify parent
  };

  return (
    <div className="mb-4 relative" ref={containerRef}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Room Number <span className="text-red-500">*</span>
      </label>

      <input
        type="text"
        value={query}
        disabled={disabled}
        placeholder="Type a number or floor (e.g. 7, G-12, S-…)"
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(""); // clear selection until they pick from list
          setOpen(true);
        }}
        onFocus={() => query.trim() && setOpen(true)}
        required
        // Hidden real value via pattern trick — validation is guarded by parent check
        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
      />

      {/* Hint chips for quick floor jump */}
      <div className="flex gap-1 mt-1 flex-wrap">
        {FLOORS.map(({ prefix, label }) => (
          <button
            key={prefix}
            type="button"
            disabled={disabled}
            onClick={() => {
              setQuery(`${prefix}-`);
              setOpen(true);
            }}
            className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
          >
            {prefix} Floor ({label})
          </button>
        ))}
      </div>

      {/* Dropdown list */}
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg">
          {filtered.map((room) => (
            <li
              key={room}
              onMouseDown={() => selectRoom(room)}
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors ${
                room === value
                  ? "bg-blue-50 dark:bg-blue-900/40 font-semibold text-blue-600 dark:text-blue-400"
                  : "text-slate-800 dark:text-slate-200"
              }`}
            >
              {room}
            </li>
          ))}
        </ul>
      )}

      {/* No matches hint */}
      {open && query.trim() && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg px-3 py-2 text-sm text-slate-400">
          No rooms found for &quot;{query}&quot;
        </div>
      )}

      {/* Show selected badge */}
      {value && (
        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
          ✅ Selected: <span className="font-semibold">{value}</span>
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Register Form
// ─────────────────────────────────────────────
const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    studentID: "",
    branch: "",
    collegeEmail: "",
    hostelBlock: "",
    roomNO: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: ensure a room was actually selected from the list
    if (!formData.roomNO) {
      toast.error("Please select a valid room number from the list");
      return;
    }

    setLoading(true);
    try {
      const { data } = await registerStudent(formData);
      toast.success(data.message || "Registration sent successfully");
      setFormData({
        fullName: "",
        studentID: "",
        branch: "",
        collegeEmail: "",
        hostelBlock: "",
        roomNO: "",
        password: "",
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-200 dark:border-slate-800"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800 dark:text-white">
          Student Registration
        </h2>

        <Input
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <Input
          label="Student ID"
          name="studentID"
          value={formData.studentID}
          onChange={handleChange}
          disabled={loading}
          required
        />

        {/* Branch Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Branch <span className="text-red-500">*</span>
          </label>
          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            <option value="" disabled>Select your branch</option>
            <option value="CSE">CSE — Computer Science &amp; Engineering</option>
            <option value="ECE">ECE — Electronics &amp; Communication</option>
            <option value="EEE">EEE — Electrical &amp; Electronics</option>
            <option value="MECH">MECH — Mechanical Engineering</option>
            <option value="CIVIL">CIVIL — Civil Engineering</option>
            <option value="METALLURGY">METALLURGY — Metallurgical Engineering</option>
            <option value="MINING">MINING — Mining Engineering</option>
            <option value="CHEMICAL">CHEMICAL — Chemical Engineering</option>
          </select>
        </div>

        <Input
          label="College Email"
          type="email"
          name="collegeEmail"
          value={formData.collegeEmail}
          onChange={handleChange}
          disabled={loading}
          required
        />

        {/* Hostel Block Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Hostel Block <span className="text-red-500">*</span>
          </label>
          <select
            name="hostelBlock"
            value={formData.hostelBlock}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            <option value="" disabled>Select your hostel block</option>
            <option value="A">Block A</option>
            <option value="B">Block B</option>
            <option value="C">Block C</option>
          </select>
        </div>

        {/* Room Number — Searchable combobox */}
        <RoomSearch
          value={formData.roomNO}
          onChange={(room) =>
            setFormData((prev) => ({ ...prev, roomNO: room }))
          }
          disabled={loading}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <Button type="submit" disabled={loading} className="w-full mt-4">
          {loading ? <Loader /> : "Register"}
        </Button>

        <p className="mt-4 text-center text-slate-400 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
