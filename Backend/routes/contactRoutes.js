const express = require("express");
const router = express.Router();
const db = require("../config/db");

// POST route to handle contact form submission
router.post("/", (req, res) => {
  const { name, email, message } = req.body;

  // 🔹 Basic Validation
  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // 🔹 Email Validation
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  // 🔹 Message Length Check
  if (message.length < 10) {
    return res.status(400).json({ error: "Message must be at least 10 characters long." });
  }

  // SQL Query to Insert Data
  const sql = "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)";
  db.query(sql, [name, email, message], (err, result) => {
    if (err) {
      console.error("❌ Error inserting data:", err);
      return res.status(500).json({ error: "Server error. Try again later." });
    }
    res.json({ message: "✅ Your message has been sent successfully!" });
  });
});

module.exports = router;
