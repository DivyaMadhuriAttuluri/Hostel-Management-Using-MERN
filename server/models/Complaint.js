import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    hostelBlock: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["electricity", "water", "mess", "fans", "lightbulb", "other"],
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "resolved"],
      default: "pending",
    },

    resolutionDate: {
      type: Date,
      default: null,
    },

    resolutionTime: {
      type: String,
      default: null,
    },

    resolutionNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
