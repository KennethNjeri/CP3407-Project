require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ✅ Connect to MySQL using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,     // RDS host
  user: process.env.DB_USER,     // admin
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306                     // default MySQL port
});

// ✅ Actually connect to the database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

// ✅ Get restaurants with pagination
// Example: /api/restaurants?page=1&limit=50
app.get("/api/restaurants", (req, res) => {
  const page = parseInt(req.query.page) || 1; // default page 1
  const limit = parseInt(req.query.limit) || 50; // default 50 per page
  const offset = (page - 1) * limit;

  // Get total count first
  db.query("SELECT COUNT(*) as count FROM Restaurants", (err, countResult) => {
    if (err) return res.status(500).json(err);
    const total = countResult[0].count;

    db.query(
      "SELECT * FROM Restaurants LIMIT ? OFFSET ?",
      [limit, offset],
      (err, results) => {
        if (err) return res.status(500).json(err);

        res.json({
          page,
          totalPages: Math.ceil(total / limit),
          totalRestaurants: total,
          restaurants: results,
        });
      }
    );
  });
});

// ✅ Search restaurants
app.get("/api/restaurants/search", (req, res) => {
  const q = `%${req.query.q}%`;
  db.query(
    "SELECT * FROM Restaurants WHERE name LIKE ? OR category LIKE ?",
    [q, q],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// ✅ Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});