import Pg from "../models/Pg.js";
import Booking from "../models/Booking.js";

/* Helpers */

const isValidRoomType = (type) =>
  ["single", "double", "triple"].includes(type);

const getPg = async (pgId) => {
  const pg = await Pg.findById(pgId);
  if (!pg) throw new Error("PG not found");
  return pg;
};

/* Check Availability */

export const checkAvailability = async (req, res) => {
  try {
    const { pgId, roomType } = req.body;

    if (!pgId || !roomType)
      return res.status(400).json({ success: false, message: "pgId & roomType required" });

    if (!isValidRoomType(roomType))
      return res.status(400).json({ success: false, message: "Invalid room type" });

    const pg = await getPg(pgId);

    const room = pg.bedsSummary[roomType];

    if (!room || room.available <= 0)
      return res.status(400).json({ success: false, message: "No beds available" });

    res.json({
      success: true,
      data: {
        availableBeds: room.available,
        pricePerMonth: pg.roomConfig[roomType].price
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Create Booking */

export const createBooking = async (req, res) => {
  try {
    const { pgId, roomType, months, startDate } = req.body;

    if (!pgId || !months || !startDate)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const pg = await Pg.findById(pgId);

    if (!pg)
      return res.status(404).json({ success: false, message: "PG not found" });

    /* ================= ROOM BOOKING ================= */
    if (pg.type === "room") {

      if (pg.occupants.current >= pg.occupants.max)
        return res.status(400).json({ success: false, message: "Room full" });

      pg.occupants.current += 1;
      await pg.save();

      const rentPerMonth = pg.roomConfig?.single?.price || 0;

      const booking = await Booking.create({
        user: req.user.id,
        pg: pgId,
        startDate,
        months,
        rentPerMonth,
        totalAmount: rentPerMonth * months,
        status: "confirmed"
      });

      return res.json({ success: true, data: booking });
    }

    /* ================= PG BOOKING ================= */

    if (!roomType)
      return res.status(400).json({ success: false, message: "Room type required" });

    if (!["single", "double", "triple"].includes(roomType))
      return res.status(400).json({ success: false, message: "Invalid room type" });

    const updatedPg = await Pg.findOneAndUpdate(
      {
        _id: pgId,
        [`bedsSummary.${roomType}.available`]: { $gt: 0 }
      },
      {
        $inc: { [`bedsSummary.${roomType}.available`]: -1 }
      },
      { new: true }
    );

    if (!updatedPg)
      return res.status(400).json({ success: false, message: "No beds available" });

    const rentPerMonth = updatedPg.roomConfig[roomType].price;

    const booking = await Booking.create({
      user: req.user.id,
      pg: pgId,
      roomType,
      startDate,
      months,
      rentPerMonth,
      totalAmount: rentPerMonth * months,
      status: "confirmed"
    });

    res.json({ success: true, data: booking });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* User Bookings */

export const listUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: "pg",
        select: "name location images owner phone",
        populate: {
          path: "owner",
          select: "name email phone "
        }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Owner Bookings */

export const getOwnerBookings = async (req, res) => {
  try {
    const pgIds = await Pg.find({ owner: req.user.id }).distinct("_id");

    const bookings = await Booking.find({ pg: { $in: pgIds } })
      .populate("user", "name email")
      .populate("pg", "name location")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Change Booking Status */

export const changeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    if (!bookingId || !["confirmed", "cancelled"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid request" });

    const booking = await Booking.findById(bookingId).populate("pg");

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.pg.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const pg = await Pg.findById(booking.pg._id);
    const roomType = booking.roomType;

    if (status === "confirmed") {
      if (pg.bedsSummary[roomType].available <= 0)
        return res.status(400).json({ success: false, message: "No beds available" });

      pg.bedsSummary[roomType].available -= 1;
    }

    if (status === "cancelled" && booking.status === "confirmed") {
      pg.bedsSummary[roomType].available += 1;
    }

    booking.status = status;

    await pg.save();
    await booking.save();

    res.json({ success: true, message: "Status updated" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Delete Booking */

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("pg");

    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.pg.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const pg = await Pg.findById(booking.pg._id);

    if (booking.status === "confirmed") {
      pg.bedsSummary[booking.roomType].available += 1;
      await pg.save();
    }

    await booking.deleteOne();

    res.json({ success: true, message: "Booking deleted successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};