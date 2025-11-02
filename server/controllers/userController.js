import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import Order from "../models/Order.js";

export const registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      userName,
      email,
      password: hashedPassword,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
      message: "User saved to database successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }
    const token = generateTokenAndSetCookie(user._id, res);
    return res.status(200).json({
      message: "User LoggedIn succesfully",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        password: user.password,
        role: user.role,
      },
      success: true,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
export const logOutUser = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res
      .status(200)
      .json({ message: "User logged out succesfully", success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // added by protectRoute middleware
    const user = await User.findById(userId).select("userName email");
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.json({ user, orders });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};
