import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    rooms: { type: Number, default: 0 },
    price: { type: Number, default: 0 }
  },
  { _id: false }
);

const bedSummarySchema = new mongoose.Schema(
  {
    total: { type: Number, default: 0 },
    available: { type: Number, default: 0 }
  },
  { _id: false }
);

const PgSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    amenities: {
      type: [String],
      default: []
    },

    images: {
      type: [String], // store image URLs (Cloudinary or local path)
      default: []
    },

    isAvailable: {
      type: Boolean,
      default: true
    },

    roomConfig: {
      single: { type: roomSchema, default: () => ({}) },
      double: { type: roomSchema, default: () => ({}) },
      triple: { type: roomSchema, default: () => ({}) }
    },

    bedsSummary: {
      single: { type: bedSummarySchema, default: () => ({}) },
      double: { type: bedSummarySchema, default: () => ({}) },
      triple: { type: bedSummarySchema, default: () => ({}) }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Pg", PgSchema);
