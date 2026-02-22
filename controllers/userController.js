import User from "../models/User.js";
import Pg from "../models/Pg.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/* =========================================
   Generate JWT
========================================= */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* =========================================
   Register User
========================================= */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.json({
        success: false,
        message: "All fields required (min 8 char password)"
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================
   Login User
========================================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================
   Get Logged In User Data
========================================= */
export const getUserData = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================
   Get All Available PGs (Public)
========================================= */
export const getAllPgs = async (req, res) => {
  try {
    const pgs = await Pg.find({ isAvailable: true })
      .select("-__v")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pgs.length,
      pgs
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

/* =========================================
   Get Single PG (IMPORTANT FOR DETAILS PAGE)
========================================= */
export const getSinglePg = async (req, res) => {
  try {
    const pg = await Pg.findById(req.params.id);

    if (!pg) {
      return res.json({
        success: false,
        message: "PG not found"
      });
    }

    res.json({
      success: true,
      pg
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};
