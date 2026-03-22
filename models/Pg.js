import mongoose from "mongoose";

/* ---------------- ROOM CONFIG ---------------- */

const roomSchema = new mongoose.Schema(
  {
    rooms: { type: Number, default: 0 },
    price: { type: Number, default: 0 }
  },
  { _id: false }
);

/* ---------------- BED SUMMARY ---------------- */

const bedSummarySchema = new mongoose.Schema(
  {
    total: { type: Number, default: 0 },
    available: { type: Number, default: 0 }
  },
  { _id: false }
);

/* ---------------- MAIN SCHEMA ---------------- */

const PgSchema = new mongoose.Schema(
  {
    /* 🔑 OWNER */
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    /* 🏠 BASIC INFO */
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

    /* 🔥 TYPE (IMPORTANT ADDITION) */
    type: {
      type: String,
      enum: ["pg", "room"],
      default: "pg",
      index: true
    },

    /* 🧾 CONTACT */
    phone: {
      type: String,
      default: "",
      trim: true
    },

    /* 🖼️ MEDIA */
    images: {
      type: [String],
      default: []
    },

    /* ⚙️ FLAGS */
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },

    isGirlsPg: {
      type: Boolean,
      default: false,
      index: true
    },

    /* 🛠️ AMENITIES */
    amenities: {
      type: [String],
      default: []
    },

    /* 🛏️ ROOM CONFIG */
    roomConfig: {
      single: { type: roomSchema, default: () => ({}) },
      double: { type: roomSchema, default: () => ({}) },
      triple: { type: roomSchema, default: () => ({}) }
    },

    /* 🧮 BED SUMMARY */
    bedsSummary: {
      single: { type: bedSummarySchema, default: () => ({}) },
      double: { type: bedSummarySchema, default: () => ({}) },
      triple: { type: bedSummarySchema, default: () => ({}) }
    },

    /* 🔥 ROOMMATE FEATURE (NEW) */
    occupants: {
      current: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 1
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Pg", PgSchema);