const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const rateLimit = require("express-rate-limit");
require("dotenv").config(); // Load environment variables

// Function to validate email format
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Utility function to query database with async/await
const queryDb = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// ✅ **Rate Limiting to prevent brute-force attacks**
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: { message: "Too many login attempts. Please try again later!" },
});

// ✅ **User Signup**
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (trimmedName.length < 3) {
      return res.status(400).json({ message: "Full Name must be at least 3 characters long!" });
    }
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email format!" });
    }
    if (trimmedPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long!" });
    }

    // Check if user already exists
    const existingUser = await queryDb("SELECT * FROM users WHERE email = ?", [trimmedEmail]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists!" });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    // Insert new user into database
    await queryDb("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      trimmedName,
      trimmedEmail,
      hashedPassword,
    ]);

    return res.status(201).json({ message: "Signup successful! Please login." });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

// ✅ **User Login**
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const users = await queryDb("SELECT * FROM users WHERE email = ?", [trimmedEmail]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    const user = users[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables.");
      return res.status(500).json({ message: "Internal server error!" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

// ✅ **Logout Function (Blacklist Token in MySQL)**
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "No token provided!" });
    }

    await queryDb("INSERT INTO blacklisted_tokens (token) VALUES (?)", [token]);

    return res.status(200).json({ message: "Logout successful!" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

// ✅ **Check if token is blacklisted**
exports.isTokenBlacklisted = async (token) => {
  try {
    const result = await queryDb("SELECT * FROM blacklisted_tokens WHERE token = ?", [token]);
    return result.length > 0;
  } catch (error) {
    console.error("Error checking blacklisted token:", error);
    return false;
  }
};
