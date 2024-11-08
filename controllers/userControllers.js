const User = require("../models/userModels.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email or mobile already exists" });
    }

    const user = new User(req.body);

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.render("addUser");
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while creating the user",
      message: error.message,
      details: error.errors,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email" });
    }

    if (!user.password) {
      return res
        .status(401)
        .json({ error: "Password not found in user record" });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // Set the JWT as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // set to true in production
      maxAge: 3600000, // 1 hour in milliseconds
    });

    // Redirect to the profile page
    res.redirect("/profile");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "An error occurred during login",
      message: error.message,
    });
  }
};

// get a user by its Id
exports.getUserByIdWithTasks = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user by ID and populate their tasks
    const user = await User.findById(userId).populate("tasks");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user and their populated tasks
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
