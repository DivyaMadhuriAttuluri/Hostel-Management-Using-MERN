import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import User from "../models/User.js";
import StudentRegistrationRequest from "../models/StudentRegRequest.js";
import GuestRoom from "../models/GuestRoom.js";
import RoomBook from "../models/RoomBook.js";
import RoomChangeRequest from "../models/RoomChangeRequest.js";
import Complaint from "../models/Complaint.js";
import Invoice from "../models/Invoice.js";
import Attendance from "../models/Attendance.js";
import Announcement from "../models/Announcement.js";
import Notification from "../models/Notification.js";
import MessMenu from "../models/MessMenu.js";
import MessLeave from "../models/MessLeave.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/hostel-management";
const PASSWORD = "Test@1234";

const BRANCHES = ["CSE", "ECE", "MEC", "EEE", "CIV", "META", "MIN"];
const HOSTELS = ["A", "B", "C"];
const USERS_PER_HOSTEL = 125;
const ADMISSION_YY = "23";

const FIRST_NAMES = [
  "Aarav",
  "Vihaan",
  "Aditya",
  "Arjun",
  "Ishaan",
  "Sai",
  "Karthik",
  "Nikhil",
  "Rohan",
  "Aman",
  "Siddharth",
  "Rahul",
  "Ankit",
  "Harsh",
  "Pranav",
  "Yash",
  "Dev",
  "Aryan",
  "Dhruv",
  "Manav",
  "Krishna",
  "Varun",
  "Akash",
  "Shivam",
  "Mihir",
  "Neel",
  "Parth",
  "Saurabh",
  "Vivek",
  "Anirudh",
];

const LAST_NAMES = [
  "Sharma",
  "Patel",
  "Reddy",
  "Naik",
  "Singh",
  "Gupta",
  "Nair",
  "Joshi",
  "Verma",
  "Iyer",
  "Rao",
  "Kulkarni",
  "Mishra",
  "Pillai",
  "Yadav",
  "Choudhary",
  "Deshmukh",
  "Bose",
  "Kumar",
  "Jain",
  "Das",
  "Mehta",
  "Thakur",
  "Kapoor",
  "Saxena",
  "Tiwari",
  "Soni",
  "Pandey",
  "Shinde",
  "Chavan",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const RELATIONS = [
  "father",
  "mother",
  "brother",
  "sister",
  "guardian",
  "uncle",
  "aunt",
];
const COMPLAINT_CATEGORIES = [
  "electricity",
  "water",
  "mess",
  "fans",
  "lightbulb",
  "other",
];
const MESS_REASONS = [
  "Outstation tournament",
  "Internship travel",
  "Medical leave",
  "Fest participation",
  "Family event",
];
const ROOM_CHANGE_REASONS = [
  "Roommate schedule conflict",
  "Frequent maintenance disruption",
  "Need quieter room for exam prep",
  "Allergy issue in current room",
  "Closer proximity to lab sessions",
];

const REQUIRED_BLOCK_A_STUDENTS = [
  {
    fullName: "Vinayak Allada",
    studentID: "bt23CSE067",
    parentName: "Sanjay Patel",
    parentPhone: "9876543210",
    bloodGroup: "O+",
  },
  {
    fullName: "Dhanvanshi Kumar",
    studentID: "bt23CSE113",
    parentName: "Suresh Nair",
    parentPhone: "9876543211",
    bloodGroup: "A+",
  },
  {
    fullName: "Aman Singh",
    studentID: "bt23CSE074",
    parentName: "Vikram Mehta",
    parentPhone: "9876543212",
    bloodGroup: "B+",
  },
  {
    fullName: "Cheril Gedam",
    studentID: "bt23CSE044",
    parentName: "Ramesh Iyer",
    parentPhone: "9876543213",
    bloodGroup: "AB+",
  },
  {
    fullName: "Nithash",
    studentID: "bt23CSE009",
    parentName: "Ajay Joshi",
    parentPhone: "9876543215",
    bloodGroup: "A-",
  },
];

function mulberry32(seed) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(23042026);

function pick(list) {
  return list[Math.floor(rand() * list.length)];
}

function int(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pad3(value) {
  return String(value).padStart(3, "0");
}

function dateOffset(daysFromToday) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  return d;
}

function makeStudentId(branch, roll) {
  return `bt${ADMISSION_YY}${branch}${pad3(roll)}`;
}

function makeFullName(index) {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last =
    LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  return `${first} ${last}`;
}

function makeParentName(index) {
  const first = FIRST_NAMES[(index + 7) % FIRST_NAMES.length];
  const last = LAST_NAMES[(index + 11) % LAST_NAMES.length];
  return `${first} ${last}`;
}

function buildStudentSlots() {
  const slots = [];
  for (const branch of BRANCHES) {
    for (let roll = 1; roll <= 125; roll += 1) {
      slots.push({ branch, roll });
    }
  }
  return slots;
}

function shuffled(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    await Promise.all([
      Notification.deleteMany({}),
      Attendance.deleteMany({}),
      MessLeave.deleteMany({}),
      MessMenu.deleteMany({}),
      Complaint.deleteMany({}),
      Invoice.deleteMany({}),
      RoomChangeRequest.deleteMany({}),
      RoomBook.deleteMany({}),
      Announcement.deleteMany({}),
      StudentRegistrationRequest.deleteMany({}),
      User.deleteMany({}),
      Admin.deleteMany({}),
      GuestRoom.deleteMany({}),
    ]);

    const admins = HOSTELS.map((hostel, idx) => ({
      adminID: `ADM${String(idx + 1).padStart(3, "0")}`,
      name: `Block ${hostel} Warden`,
      email: `admin.block${hostel.toLowerCase()}@vnit.ac.in`,
      password: hashedPassword,
      hostelBlock: hostel,
      role: "admin",
    }));

    const createdAdmins = await Admin.insertMany(admins);
    const adminByBlock = new Map(createdAdmins.map((a) => [a.hostelBlock, a]));

    const guestRooms = [];
    for (let i = 1; i <= 120; i += 1) {
      guestRooms.push({
        guestHostelBlock: "GUEST_HOSTEL",
        roomNo: pad3(i),
        capacity: i <= 40 ? 3 : 2,
        isActive: true,
      });
    }
    await GuestRoom.insertMany(guestRooms);

    const requiredIds = new Set(
      REQUIRED_BLOCK_A_STUDENTS.map((student) => student.studentID),
    );

    const allSlots = shuffled(buildStudentSlots()).filter(
      (slot) => !requiredIds.has(makeStudentId(slot.branch, slot.roll)),
    );
    const requiredUsers = HOSTELS.length * USERS_PER_HOSTEL;
    if (allSlots.length < requiredUsers) {
      throw new Error(
        `Not enough branch-roll combinations. Need ${requiredUsers}, have ${allSlots.length}.`,
      );
    }

    const users = [];
    for (let i = 0; i < requiredUsers; i += 1) {
      const hostel = HOSTELS[Math.floor(i / USERS_PER_HOSTEL)];
      const slot = allSlots[i];
      const studentID = makeStudentId(slot.branch, slot.roll);
      const roomNO = pad3((i % USERS_PER_HOSTEL) + 1);

      users.push({
        fullName: makeFullName(i),
        studentID,
        branch: slot.branch,
        collegeEmail: `${studentID.toLowerCase()}@students.vnit.ac.in`,
        hostelBlock: hostel,
        roomNO,
        password: hashedPassword,
        role: "student",
        isApproved: true,
        approvedBy: adminByBlock.get(hostel)._id,
        isActive: true,
        parentName: makeParentName(i),
        parentPhone: `9${String(100000000 + i).slice(0, 9)}`,
        bloodGroup: pick(BLOOD_GROUPS),
      });
    }

    const forcedRooms = ["121", "122", "123", "124", "125"];
    for (let i = 0; i < REQUIRED_BLOCK_A_STUDENTS.length; i += 1) {
      const forcedStudent = REQUIRED_BLOCK_A_STUDENTS[i];
      const roomNO = forcedRooms[i];
      const replaceIndex = users.findIndex(
        (user) => user.hostelBlock === "A" && user.roomNO === roomNO,
      );

      if (replaceIndex === -1) {
        throw new Error(`Unable to reserve room ${roomNO} for forced student`);
      }

      users[replaceIndex] = {
        ...users[replaceIndex],
        fullName: forcedStudent.fullName,
        studentID: forcedStudent.studentID,
        branch: "CSE",
        collegeEmail: `${forcedStudent.studentID.toLowerCase()}@students.vnit.ac.in`,
        hostelBlock: "A",
        roomNO,
        password: hashedPassword,
        role: "student",
        isApproved: true,
        approvedBy: adminByBlock.get("A")._id,
        isActive: true,
        parentName: forcedStudent.parentName,
        parentPhone: forcedStudent.parentPhone,
        bloodGroup: forcedStudent.bloodGroup,
      };
    }

    const createdUsers = await User.insertMany(users);

    const regRequests = [];
    for (let i = 0; i < 90; i += 1) {
      const slot = allSlots[requiredUsers + i];
      const hostel = HOSTELS[i % HOSTELS.length];
      const studentID = makeStudentId(slot.branch, slot.roll);
      const statusPool = i < 60 ? "pending" : i < 80 ? "approved" : "rejected";
      regRequests.push({
        fullName: makeFullName(requiredUsers + i),
        studentID,
        branch: slot.branch,
        collegeEmail: `${studentID.toLowerCase()}@students.vnit.ac.in`,
        hostelBlock: hostel,
        roomNO: pad3(int(1, 200)),
        password: hashedPassword,
        parentName: makeParentName(requiredUsers + i),
        parentPhone: `8${String(100000000 + i).slice(0, 9)}`,
        bloodGroup: pick(BLOOD_GROUPS),
        status: statusPool,
        rejectionReason:
          statusPool === "rejected" ? "Incomplete document verification" : null,
      });
    }
    await StudentRegistrationRequest.insertMany(regRequests);

    const complaints = [];
    for (let i = 0; i < createdUsers.length * 2; i += 1) {
      const student = createdUsers[i % createdUsers.length];
      const status =
        i % 10 < 5 ? "pending" : i % 10 < 8 ? "accepted" : "resolved";
      const resolutionDate =
        status === "resolved" ? dateOffset(-int(1, 20)) : null;
      complaints.push({
        student: student._id,
        hostelBlock: student.hostelBlock,
        category: pick(COMPLAINT_CATEGORIES),
        description: `Issue reported in room ${student.roomNO}: ticket ${i + 1}`,
        status,
        resolutionDate,
        resolutionTime:
          status === "resolved"
            ? `${String(int(9, 18)).padStart(2, "0")}:${pick(["00", "15", "30", "45"])}`
            : null,
        resolutionNote:
          status === "resolved" ? "Issue resolved after maintenance visit" : "",
      });
    }
    const createdComplaints = await Complaint.insertMany(complaints);

    const roomChanges = [];
    for (let i = 0; i < Math.floor(createdUsers.length * 0.7); i += 1) {
      const student = createdUsers[i];
      const status =
        i % 10 < 5 ? "pending" : i % 10 < 8 ? "approved" : "rejected";
      const currentRoom = Number(student.roomNO);
      let requestedRoom =
        ((currentRoom + int(1, 20) - 1) % USERS_PER_HOSTEL) + 1;
      if (requestedRoom === currentRoom) {
        requestedRoom = (requestedRoom % USERS_PER_HOSTEL) + 1;
      }
      roomChanges.push({
        student: student._id,
        currentHostelBlock: student.hostelBlock,
        currentRoomNO: student.roomNO,
        requestedRoomNO: pad3(requestedRoom),
        reason: pick(ROOM_CHANGE_REASONS),
        status,
        adminRemarks:
          status === "rejected"
            ? "Requested room currently unavailable"
            : status === "approved"
              ? "Approved for next allocation cycle"
              : null,
      });
    }
    const createdRoomChanges = await RoomChangeRequest.insertMany(roomChanges);

    const roomBooks = [];
    const visitorNames = [
      "Suresh",
      "Lakshmi",
      "Anita",
      "Ramesh",
      "Neha",
      "Pooja",
      "Akhil",
      "Maya",
      "Arun",
      "Deepa",
    ];
    for (let i = 0; i < 180; i += 1) {
      const student = createdUsers[int(0, createdUsers.length - 1)];
      const startInDays = int(-20, 40);
      const stay = int(1, 4);
      roomBooks.push({
        student: student._id,
        guestHostelBlock: "GUEST_HOSTEL",
        visitorName: `${pick(visitorNames)} ${pick(LAST_NAMES)}`,
        relation: pick(RELATIONS),
        guestRoomNO: pad3((i % 120) + 1),
        dateFrom: dateOffset(startInDays),
        dateTo: dateOffset(startInDays + stay),
        purpose: pick([
          "Family visit",
          "Medical appointment support",
          "Exam week support",
          "Convocation visit",
        ]),
        status: i % 10 < 5 ? "pending" : i % 10 < 8 ? "approved" : "rejected",
      });
    }
    const createdRoomBooks = await RoomBook.insertMany(roomBooks);

    const invoices = [];
    let invoiceSeq = 1;
    for (const student of createdUsers) {
      const baseTitles = [
        {
          title: "Hostel Fee - Semester 1",
          amount: int(24000, 30000),
          offset: -45,
        },
        {
          title: "Mess Fee - Quarter 1",
          amount: int(9000, 13000),
          offset: -20,
        },
        { title: "Maintenance Charge", amount: int(1000, 2500), offset: 10 },
        { title: "Electricity Adjustment", amount: int(600, 1800), offset: 20 },
      ];

      for (const item of baseTitles) {
        invoices.push({
          invoiceID: `INV-2026-${String(invoiceSeq).padStart(6, "0")}`,
          student: student._id,
          hostelBlock: student.hostelBlock,
          title: item.title,
          description: `${item.title} for hostel block ${student.hostelBlock}`,
          amount: item.amount,
          dueDate: dateOffset(item.offset),
          status: item.offset < 0 && rand() > 0.35 ? "paid" : "pending",
          isBroadcast: false,
        });
        invoiceSeq += 1;
      }
    }
    const createdInvoices = await Invoice.insertMany(invoices);

    const attendance = [];
    for (const student of createdUsers) {
      for (let day = 0; day < 30; day += 1) {
        const status = rand() > 0.1 ? "present" : "absent";
        attendance.push({
          student: student._id,
          date: dateOffset(-day),
          status,
        });
      }
    }
    const createdAttendance = await Attendance.insertMany(attendance);

    const announcements = [];
    for (const hostel of HOSTELS) {
      const admin = adminByBlock.get(hostel);
      for (let i = 0; i < 15; i += 1) {
        announcements.push({
          title: pick([
            "Water Supply Notice",
            "Study Hall Timings",
            "Mess Timing Update",
            "Block Inspection",
            "Maintenance Drive",
            "Festival Event Info",
          ]),
          message: `Block ${hostel}: update #${i + 1} for residents.`,
          hostelBlock: hostel,
          createdBy: admin._id,
          createdAt: dateOffset(-int(1, 60)),
          updatedAt: new Date(),
        });
      }
    }
    const createdAnnouncements = await Announcement.insertMany(announcements);

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const breakfastItems = [
      "Poha",
      "Upma",
      "Idli Sambar",
      "Paratha",
      "Dosa",
      "Bread Omelette",
      "Chole Kulche",
    ];
    const lunchItems = [
      "Dal Rice",
      "Rajma Rice",
      "Veg Biryani",
      "Sambar Rice",
      "Paneer Curry",
      "Chole Bhature",
      "Mix Veg",
    ];
    const snackItems = [
      "Tea and Biscuits",
      "Samosa",
      "Bhel",
      "Sprouts",
      "Banana Shake",
      "Pav Bhaji",
      "Cutlet",
    ];
    const dinnerItems = [
      "Roti Sabzi",
      "Kadhi Rice",
      "Egg Curry",
      "Pulao",
      "Dal Tadka",
      "Paneer Masala",
      "Aloo Gobhi",
    ];

    const menus = [];
    for (const hostel of HOSTELS) {
      const admin = adminByBlock.get(hostel);
      for (const day of days) {
        menus.push({
          hostelBlock: hostel,
          day,
          breakfast: pick(breakfastItems),
          lunch: pick(lunchItems),
          snacks: pick(snackItems),
          dinner: pick(dinnerItems),
          createdBy: admin._id,
        });
      }
    }
    const createdMenus = await MessMenu.insertMany(menus);

    const messLeaves = [];
    for (let i = 0; i < 300; i += 1) {
      const student = createdUsers[int(0, createdUsers.length - 1)];
      const start = int(-30, 30);
      const end = start + int(1, 5);
      messLeaves.push({
        student: student._id,
        hostelBlock: student.hostelBlock,
        startDate: dateOffset(start),
        endDate: dateOffset(end),
        reason: pick(MESS_REASONS),
        status: i % 10 < 5 ? "pending" : i % 10 < 8 ? "approved" : "rejected",
      });
    }
    const createdMessLeaves = await MessLeave.insertMany(messLeaves);

    const notifications = [];

    for (let i = 0; i < createdComplaints.length; i += 1) {
      if (i % 3 !== 0) {
        continue;
      }
      const complaint = createdComplaints[i];
      notifications.push({
        student: complaint.student,
        type: "complaint",
        title: `Complaint ${complaint.status.toUpperCase()}`,
        message: `Your complaint in block ${complaint.hostelBlock} is now ${complaint.status}.`,
        isRead: rand() > 0.5,
        refId: complaint._id,
      });
    }

    for (let i = 0; i < createdInvoices.length; i += 1) {
      if (i % 8 !== 0) {
        continue;
      }
      const invoice = createdInvoices[i];
      notifications.push({
        student: invoice.student,
        type: "invoice",
        title: "New Invoice Generated",
        message: `Invoice ${invoice.invoiceID} of amount Rs.${invoice.amount} is available.`,
        isRead: rand() > 0.6,
        refId: invoice._id,
      });
    }

    for (let i = 0; i < createdRoomBooks.length; i += 1) {
      const booking = createdRoomBooks[i];
      notifications.push({
        student: booking.student,
        type: "booking",
        title: "Guest Room Booking Update",
        message: `Guest room booking for room ${booking.guestRoomNO} is ${booking.status}.`,
        isRead: rand() > 0.5,
        refId: booking._id,
      });
    }

    for (let i = 0; i < createdMessLeaves.length; i += 1) {
      if (i % 2 !== 0) {
        continue;
      }
      const leave = createdMessLeaves[i];
      notifications.push({
        student: leave.student,
        type: "mess_leave",
        title: "Mess Leave Request Status",
        message: `Your mess leave request is currently ${leave.status}.`,
        isRead: rand() > 0.5,
        refId: leave._id,
      });
    }

    const createdNotifications = await Notification.insertMany(notifications);

    const counts = {
      admins: createdAdmins.length,
      users: createdUsers.length,
      registrationRequests: regRequests.length,
      guestRooms: guestRooms.length,
      roomBookings: createdRoomBooks.length,
      roomChangeRequests: createdRoomChanges.length,
      complaints: createdComplaints.length,
      invoices: createdInvoices.length,
      attendance: createdAttendance.length,
      announcements: createdAnnouncements.length,
      notifications: createdNotifications.length,
      messMenu: createdMenus.length,
      messLeaves: createdMessLeaves.length,
    };

    console.log("Seed completed successfully");
    console.log(JSON.stringify(counts, null, 2));
    console.log(`Credentials password for seeded users/admins: ${PASSWORD}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
