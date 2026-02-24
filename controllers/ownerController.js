import User from "../models/User.js";
import Pg from "../models/Pg.js";
import imagekit from "../config/imagekit.js";

/* =========================================
   Helpers
========================================= */

// Upload Images to ImageKit
const uploadImages = async (files = []) => {
  const urls = [];

  for (let file of files) {
    const response = await imagekit.files.upload({
      file: file.buffer.toString("base64"),
      fileName: file.originalname,
      folder: "pg-rental",
      useUniqueFileName: true
    });

    urls.push(response.url);
  }

  return urls;
};

// Calculate Beds Summary
const calculateBeds = (roomConfig = {}) => {
  const sharingMap = { single: 1, double: 2, triple: 3 };
  const bedsSummary = {};

  Object.keys(sharingMap).forEach(type => {
    const rooms = roomConfig?.[type]?.rooms || 0;
    const total = rooms * sharingMap[type];

    bedsSummary[type] = {
      total,
      available: total
    };
  });

  return bedsSummary;
};

/* =========================================
   Change Role → Become Owner
========================================= */
export const changeRoleToOwner = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { role: "owner" },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================
   Add PG
========================================= */
export const AddPg = async (req, res) => {
  try {
    if (!req.body.pgData) {
      return res.json({
        success: false,
        message: "pgData is required"
      });
    }

    const pgData = JSON.parse(req.body.pgData);
    const { name, location, roomConfig } = pgData;

    if (!name || !location) {
      return res.json({
        success: false,
        message: "Name and Location are required"
      });
    }

    const imageUrls = await uploadImages(req.files);
    const bedsSummary = calculateBeds(roomConfig);

    const newPg = await Pg.create({
      owner: req.user.id,
      ...pgData,
      images: imageUrls,
      bedsSummary
    });

    res.json({
      success: true,
      data: newPg
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================
   Get Owner PGs
========================================= */
export const getOwnerPgs = async (req, res) => {
  try {
    const pgs = await Pg.find({ owner: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pgs.length,
      data: pgs
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================
   Toggle PG Availability
========================================= */
export const togglePgAvailability = async (req, res) => {
  try {
    const { pgId } = req.params;

    const pg = await Pg.findById(pgId);

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: "PG not found"
      });
    }

    // ✅ safest ObjectId comparison
    if (!pg.owner.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // 🔥 force toggle
    pg.isAvailable = !pg.isAvailable;

    await pg.save();

    return res.status(200).json({
      success: true,
      isAvailable: pg.isAvailable
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================
   Delete PG
========================================= */
export const deletePg = async (req, res) => {
  try {
    const { pgId } = req.params;

    const pg = await Pg.findById(pgId);

    if (!pg) {
      return res.json({
        success: false,
        message: "PG not found"
      });
    }

    if (pg.owner.toString() !== req.user.id) {
      return res.json({
        success: false,
        message: "Unauthorized"
      });
    }

    await Pg.findByIdAndDelete(pgId);

    res.json({
      success: true,
      message: "PG deleted successfully"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================
   Dashboard Stats
========================================= */
export const getDashboardData = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const pgs = await Pg.find({ owner: ownerId });

    let totalRooms = 0;
    let totalBeds = 0;
    let availableBeds = 0;

    pgs.forEach(pg => {
      Object.values(pg.roomConfig).forEach(room => {
        totalRooms += room.rooms || 0;
      });

      Object.values(pg.bedsSummary).forEach(room => {
        totalBeds += room.total || 0;
        availableBeds += room.available || 0;
      });
    });

    const occupiedBeds = totalBeds - availableBeds;

    const occupancyRate =
      totalBeds === 0
        ? 0
        : ((occupiedBeds / totalBeds) * 100).toFixed(2);

    res.json({
      success: true,
      data: {
        totalPgs: pgs.length,
        availablePgs: pgs.filter(pg => pg.isAvailable).length,
        totalRooms,
        totalBeds,
        availableBeds,
        occupiedBeds,
        occupancyRate: `${occupancyRate}%`
      }
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================
   Update User Profile Image
========================================= */
export const updateUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        success: false,
        message: "Image file is required"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    // Delete old image if exists
    if (user.image?.fileId) {
      await imagekit.files.deleteFile(user.image.fileId);
    }

    const response = await imagekit.files.upload({
      file: req.file.buffer.toString("base64"),
      fileName: req.file.originalname,
      folder: "user-profile",
      useUniqueFileName: true
    });

    user.image = {
      url: response.url,
      fileId: response.fileId
    };

    await user.save();

    res.json({
      success: true,
      message: "Profile image updated",
      image: user.image
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};


/* =========================================
   Get All Public PGs
========================================= */
export const getAllPgs = async (req, res) => {
  try {
    const pgs = await Pg.find({ isAvailable: true })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pgs.length,
      pgs
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

