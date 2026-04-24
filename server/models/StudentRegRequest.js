// models/StudentRegistrationRequest.js
import mongoose from "mongoose";

const studentRegistrationRequestSchema = new mongoose.Schema(
  {
    fullName: {
       type: String,
        required: true
    },
    studentID: {
       type: String, 
       required: true
    },
    branch: {
       type: String, 
       required: true 
    },
    collegeEmail: { 
      type: String, 
      required: true 
    },
    hostelBlock: { 
      type: String, 
      required: true 
    },
    roomNO: { 
      type: String, 
      required: true 
    },

    password: { 
      type: String, 
      required: true 
    }, // hashed

    // 🆘 Emergency Contact
    parentName: {
      type: String,
      default: "",
      trim: true,
    },
    parentPhone: {
      type: String,
      default: "",
      trim: true,
    },
    bloodGroup: {
      type: String,
      default: "",
      enum: ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String, 
      default: null,
    },
  },
  { timestamps: true }
);

studentRegistrationRequestSchema.index(
  { hostelBlock: 1, roomNO: 1, status: 1 }
);

export default mongoose.model(
  "StudentRegistrationRequest",
  studentRegistrationRequestSchema
);
