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
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true,
      index: true
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
      type: [String],
      default: []
    },

    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },

    phone: {
  type: String,
  required: false,
  default: "",
  trim: true
},

    isGirlsPg: {
      type: Boolean,
      default: false,
      index: true
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