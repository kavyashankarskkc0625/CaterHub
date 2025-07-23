const mysql = require("mysql2");
require("dotenv").config();

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL Database");

  // Create blacklisted_tokens table if not exists
  const createBlacklistTable = `
    CREATE TABLE IF NOT EXISTS blacklisted_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      token TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createBlacklistTable, (err) => {
    if (err) {
      console.error("❌ Error creating blacklisted_tokens table:", err);
    } else {
      console.log("✅ Blacklisted Tokens table is ready");
    }
  });
});

module.exports = db;
