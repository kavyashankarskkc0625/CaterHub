const express = require("express");
const router = express.Router();
const db = require("../config/db"); // MySQL connection file

// API Endpoint for Booking Form
router.post("/", async (req, res) => {
    const { country, state, city, eventType, service, menuPreference, date, name, contactNo, email, address } = req.body;

    try {
        // ✅ Validate required fields
        if (!country || !state || !city || !eventType || !service || !menuPreference || !date || !name || !contactNo || !email || !address) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        // ✅ Validate contact number format (10-digit numeric)
        if (!/^\d{10}$/.test(contactNo)) {
            return res.status(400).json({ success: false, message: "Invalid contact number. It must be a 10-digit numeric value." });
        }

        // ✅ Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format." });
        }

        // ✅ Validate date format (YYYY-MM-DD)
        let formattedDate;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            try {
                formattedDate = new Date(date).toISOString().split("T")[0];
            } catch (error) {
                return res.status(400).json({ success: false, message: "Invalid date format." });
            }
        } else {
            formattedDate = date;
        }

        // ✅ SQL Query to insert data (using async/await for better handling)
        const sql = `
            INSERT INTO bookings (country, state, city, eventType, service, menuPreference, date, name, contactNo, email, address) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [country, state, city, eventType, service, menuPreference, formattedDate, name, contactNo, email, address], (err, result) => {
            if (err) {
                console.error("❌ Database Error:", err);
                return res.status(500).json({ success: false, message: "Database error. Please try again later." });
            }
            res.status(201).json({ success: true, message: "🎉 Booking successfully saved!" });
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
    }
});

module.exports = router;
