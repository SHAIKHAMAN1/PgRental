import express from "express";
import {
  checkAvailability,
  createBooking,
  listUserBookings,
  getOwnerBookings,
  changeBookingStatus,
  deleteBooking
} from "../controllers/BookingController.js";

import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

/* ===========================
   Student Routes
=========================== */

// Check room availability
bookingRouter.post("/check-availability", checkAvailability);

// Create booking
bookingRouter.post("/create", protect, createBooking);

// Logged-in user's bookings
bookingRouter.get("/user", protect, listUserBookings);

/* ===========================
   Owner Routes
=========================== */

// Owner: get all bookings of his PGs
bookingRouter.get("/owner", protect, getOwnerBookings);

// Owner: change booking status
bookingRouter.put("/change-status", protect, changeBookingStatus);

// Owner: delete booking
bookingRouter.delete("/:id", protect, deleteBooking);

export default bookingRouter;
