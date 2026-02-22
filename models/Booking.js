import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // Student who booked
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // PG booked
    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pg",
      required: true
    },

    // Room type selected
    roomType: {
      type: String,
      enum: ["single", "double", "triple"],
      required: true
    },

    // Start date of stay
    startDate: {
      type: Date,
      required: true
    },

    // Number of months
    months: {
      type: Number,
      required: true,
      min: 1
    },

    // Price per month at time of booking
    rentPerMonth: {
      type: Number,
      required: true
    },

    // Total amount calculated
    totalAmount: {
      type: Number,
      required: true
    },

    // Booking status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending"
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid"
    }

  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
