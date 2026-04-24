import mongoose from "mongoose";

const roomChangeRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    currentHostelBlock: {
      type: String,
      required: true,
    },

    currentRoomNO: {
      type: String,
      required: true,
    },

    requestedRoomNO: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    adminRemarks: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RoomChangeRequest", roomChangeRequestSchema);
