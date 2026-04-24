/**
 * 🌱 Seed Script — Creates test admins and students
 *
 * Usage:  npm run seed:users
 *
 * ⚠️  This will DELETE all existing admins & students, then re-create them.
 *
 * Student ID format : bt23<branch><rollno>  (e.g. bt23cse067)
 * Email format      : <studentID>@students.vnit.ac.in
 * All passwords     : Test@1234
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import User from "../models/User.js";

dotenv.config();

const PASSWORD = "Test@1234";

const seedUsers = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hostel-management",
    );
    console.log("✅ Connected to MongoDB\n");

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // ────────────────────── ADMINS (3) ──────────────────────
    await Admin.deleteMany({});
    console.log("🗑️  Cleared existing admins");

    const admins = [
      {
        adminID: "ADM001",
        name: "Vinayak Allada",
        email: "admin.blocka@vnit.ac.in",
        password: hashedPassword,
        hostelBlock: "A",
        role: "admin",
      },
      {
        adminID: "ADM002",
        name: "Rajesh Kumar",
        email: "admin.blockb@vnit.ac.in",
        password: hashedPassword,
        hostelBlock: "B",
        role: "admin",
      },
      {
        adminID: "ADM003",
        name: "Anil Reddy",
        email: "admin.blockc@vnit.ac.in",
        password: hashedPassword,
        hostelBlock: "C",
        role: "admin",
      },
    ];

    const createdAdmins = await Admin.insertMany(admins);
    console.log(`✅ Created ${createdAdmins.length} admins`);

    // ────────────────────── STUDENTS (10) ──────────────────────
    await User.deleteMany({});
    console.log("\n🗑️  Cleared existing students");

    const students = [
      // --- Block A (CSE students) ---
      {
        fullName: "Vinayak Allada",
        studentID: "bt23cse067",
        branch: "CSE",
        collegeEmail: "bt23cse067@students.vnit.ac.in",
        hostelBlock: "A",
        roomNO: "101",
        password: hashedPassword,
        isApproved: true,
        approvedBy: createdAdmins[0]._id,
        parentName: "Sanjay Patel",
        parentPhone: "9876543210",
        bloodGroup: "O+",
      },
      {
        fullName: "Dhanvanshi Kumar",
        studentID: "bt23cse113",
        branch: "CSE",
        collegeEmail: "bt23cse113@students.vnit.ac.in",
        hostelBlock: "A",
        roomNO: "102",
        password: hashedPassword,
        isApproved: true,
        approvedBy: createdAdmins[0]._id,
        parentName: "Suresh Nair",
        parentPhone: "9876543211",
        bloodGroup: "A+",
      },
      {
        fullName: "Aman Singh",
        studentID: "bt23cse074",
        branch: "CSE",
        collegeEmail: "bt23cse074@students.vnit.ac.in",
        hostelBlock: "A",
        roomNO: "103",
        password: hashedPassword,
        isApproved: true,
        approvedBy: createdAdmins[0]._id,
        parentName: "Vikram Mehta",
        parentPhone: "9876543212",
        bloodGroup: "B+",
      },
      {
        fullName: "Cheril Gedam",
        studentID: "bt23cse044",
        branch: "CSE",
        collegeEmail: "bt23cse044@students.vnit.ac.in",
        hostelBlock: "A",
        roomNO: "104",
        password: hashedPassword,
        isApproved: true,
        approvedBy: createdAdmins[0]._id,
        parentName: "Ramesh Iyer",
        parentPhone: "9876543213",
        bloodGroup: "AB+",
      },
      {
        fullName: "Nithash",
        studentID: "bt23cse009",
        branch: "CSE",
        collegeEmail: "bt23cse009@students.vnit.ac.in",
        hostelBlock: "A",
        roomNO: "105",
        password: hashedPassword,
        isApproved: true,
        approvedBy: createdAdmins[0]._id,
        parentName: "Ajay Joshi",
        parentPhone: "9876543215",
        bloodGroup: "A-",
      },
      // --- Block B (ECE students) ---
      {
        fullName: "Karthik",
        studentID: "bt23ece042",
        branch: "ECE",
        collegeEmail: "bt23ece042@students.vnit.ac.in",
        hostelBlock: "B",
        roomNO: "202",
        password: hashedPassword,
        isApproved: true,
        approvedBy: createdAdmins[1]._id,
        parentName: "Narayana Rao",
        parentPhone: "9876543214",
        bloodGroup: "O-",
      },
      // --- Block C (MECH students) ---
      {
        fullName: "Arjun Singh",
        studentID: "bt23mec015",
        branch: "MECH",
        collegeEmail: "bt23mec015@students.vnit.ac.in",
        hostelBlock: "C",
        roomNO: "301",
        password: hashedPassword,
        isApproved: true,
        approvedBy: createdAdmins[2]._id,
        parentName: "Harpreet Singh",
        parentPhone: "9876543216",
        bloodGroup: "B-",
      },
      {
        fullName: "Gupta",
        studentID: "bt23mec016",
        branch: "MECH",
        collegeEmail: "bt23mec016@students.vnit.ac.in",
        hostelBlock: "C",
        roomNO: "302",
        password: hashedPassword,
        isApproved: true,
        approvedBy: createdAdmins[2]._id,
        parentName: "Rajeev Gupta",
        parentPhone: "9876543217",
        bloodGroup: "AB-",
      },
      // --- Unapproved / Pending students ---
      {
        fullName: "Vikash Tiwari",
        studentID: "bt23cse070",
        branch: "CSE",
        collegeEmail: "bt23cse070@students.vnit.ac.in",
        hostelBlock: "A",
        roomNO: "104",
        password: hashedPassword,
        isApproved: false,
        parentName: "Manoj Tiwari",
        parentPhone: "9876543218",
        bloodGroup: "O+",
      },
      {
        fullName: "Pandith Deshmukh",
        studentID: "bt23ece044",
        branch: "ECE",
        collegeEmail: "bt23ece044@students.vnit.ac.in",
        hostelBlock: "B",
        roomNO: "204",
        password: hashedPassword,
        isApproved: false,
        parentName: "Ganesh Deshmukh",
        parentPhone: "9876543219",
        bloodGroup: "A+",
      },
    ];

    await User.insertMany(students);
    console.log(
      `✅ Created ${students.length} students (8 approved, 2 pending)\n`,
    );

    // ────────────────────── SUMMARY ──────────────────────
    console.log("═".repeat(55));
    console.log("  🔑  ALL PASSWORDS:  Test@1234");
    console.log("═".repeat(55));
    console.log("\n📋 ADMIN ACCOUNTS:");
    console.log("─".repeat(55));
    admins.forEach((a) => {
      console.log(
        `  ${a.name.padEnd(18)} | ${a.email.padEnd(28)} | Block ${a.hostelBlock}`,
      );
    });
    console.log("\n📋 STUDENT ACCOUNTS:");
    console.log("─".repeat(55));
    students.forEach((s) => {
      const status = s.isApproved ? "✅" : "⏳";
      console.log(
        `  ${status} ${s.studentID.padEnd(14)} | ${s.fullName.padEnd(18)} | Block ${s.hostelBlock}-${s.roomNO}`,
      );
    });
    console.log("\n  Email pattern: <studentID>@students.vnit.ac.in");
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedUsers();
