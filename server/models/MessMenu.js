import mongoose from "mongoose";

const messMenuSchema = new mongoose.Schema(
  {
    hostelBlock: {
      type: String,
      required: true,
    },

    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },

    breakfast: {
      type: String,
      required: true,
      trim: true,
    },

    lunch: {
      type: String,
      required: true,
      trim: true,
    },

    snacks: {
      type: String,
      default: "",
      trim: true,
    },

    dinner: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

// One entry per day per block
messMenuSchema.index({ hostelBlock: 1, day: 1 }, { unique: true });

export default mongoose.model("MessMenu", messMenuSchema);
