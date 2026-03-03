require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

// You no longer need CORS if everything runs from same server
app.use(express.json());

const PORT = process.env.PORT || 80;

//  Connect to MySQL using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});


// ================= API ROUTES =================

// Get restaurants (with optional search)
app.get("/api/restaurants", (req, res) => {
  const search = req.query.q;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  let baseQuery = "FROM Restaurants";
  let params = [];

  // If searching
  if (search && search.trim() !== "") {
    baseQuery += " WHERE name LIKE ? OR category LIKE ? OR city LIKE ?";
    const q = `%${search}%`;
    params.push(q, q, q);
  }

  // First get total count
  db.query(`SELECT COUNT(*) as count ${baseQuery}`, params, (err, countResult) => {
    if (err) return res.status(500).json(err);

    const total = countResult[0].count;
    const totalPages = Math.ceil(total / limit);

    // Then get actual data
    db.query(
      `SELECT * ${baseQuery} ORDER BY name ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
      (err, results) => {
        if (err) return res.status(500).json(err);

        res.json({
          page,
          totalPages,
          totalRestaurants: total,
          restaurants: results
        });
      }
    );
  });
});


// ================= SERVE REACT =================

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../client/dist")));

// React Router fix (must be LAST)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});
// ================= START SERVER =================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});