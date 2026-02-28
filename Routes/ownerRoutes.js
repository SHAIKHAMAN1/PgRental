import express from "express";
import {
  AddPg,
  changeRoleToOwner,
  deletePg,
  getDashboardData,
  getOwnerPgs,
  togglePgAvailability,
  updateUserImage,
  updatePg
} from "../controllers/ownerController.js";

import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

/* Role */
ownerRouter.post("/change-role", protect, changeRoleToOwner);

/* PG */
ownerRouter.post("/add-pg", protect, upload.array("images", 10), AddPg);

ownerRouter.get("/pgs", protect, getOwnerPgs);

ownerRouter.patch("/toggle-pg/:pgId", protect, togglePgAvailability);

ownerRouter.delete("/delete-pg/:pgId", protect, deletePg);

/* Dashboard */
ownerRouter.get("/dashboard", protect, getDashboardData);

ownerRouter.put("/update-pg/:pgId", protect, updatePg);   // ✅ ADD THIS
/* Profile */
ownerRouter.post(
  "/update-image",
  protect,
  upload.single("image"),
  updateUserImage
);

export default ownerRouter;
