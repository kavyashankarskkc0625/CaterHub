const db = require("../config/db");
const bcrypt = require("bcryptjs");
const util = require("util");

const query = util.promisify(db.query).bind(db);

// Function to validate email format
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const createUser = async (name, email, password) => {
  try {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      throw new Error("All fields are required!");
    }

    if (trimmedName.length < 3) {
      throw new Error("Full Name must be at least 3 characters long!");
    }

    if (!isValidEmail(trimmedEmail)) {
      throw new Error("Invalid email format!");
    }

    if (trimmedPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long!");
    }

    const existingUser = await findUserByEmail(trimmedEmail);
    if (existingUser) {
      throw new Error("User already exists!");
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    const result = await query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      trimmedName,
      trimmedEmail,
      hashedPassword,
    ]);

    return result;
  } catch (error) {
    console.error("Error in createUser:", error.message);
    throw new Error(error.message || "User creation failed!");
  }
};

const findUserByEmail = async (email) => {
  try {
    const result = await query("SELECT * FROM users WHERE email = ?", [email]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error in findUserByEmail:", error.message);
    throw new Error("Database error! Please try again.");
  }
};

module.exports = { createUser, findUserByEmail };
