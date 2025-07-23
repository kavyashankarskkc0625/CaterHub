const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Fetch latest booking details
router.get("/booking/latest", (req, res) => {
  db.query("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1", (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching booking", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "No booking found" });
    }
    res.json(result[0]);
  });
});

// Process Payment
router.post("/payment", (req, res) => {
  const { bookingId, amount, paymentMethod } = req.body;

  const sql = "INSERT INTO payments (booking_id, amount, payment_method, status) VALUES (?, ?, ?, 'Paid')";
  db.query(sql, [bookingId, amount, paymentMethod], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Payment failed", error: err });
    }
    res.json({ success: true, message: "Payment successful" });
  });
});

module.exports = router;
