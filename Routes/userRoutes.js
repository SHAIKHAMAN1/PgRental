import express from "express";
import {
  registerUser,
  loginUser,
  getUserData,
  getAllPgs,
  getSinglePg
} from "../controllers/userController.js";

import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/data", protect, getUserData);

userRouter.get("/all-pgs",protect, getAllPgs);
userRouter.get("/pg/:id",protect, getSinglePg);

export default userRouter;
