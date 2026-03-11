require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 80;

// ================= DATABASE =================

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});


// ================= RESTAURANT SEARCH =================

app.get("/api/restaurants", (req, res) => {

  const search = req.query.q;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  let baseQuery = "FROM Restaurants r";
  let params = [];

  // UberEats style search
  if (search && search.trim() !== "") {

    const q = `%${search}%`;

    baseQuery = `
      FROM Restaurants r
      WHERE
        r.name LIKE ?
        OR r.category LIKE ?
        OR r.full_address LIKE ?
        OR r.id IN (
          SELECT restaurant_id
          FROM Menu_Items
          WHERE
            name LIKE ?
            OR category LIKE ?
            OR description LIKE ?
        )
    `;

    params = [q, q, q, q, q, q];
  }

  // Get total count
  db.query(`SELECT COUNT(*) as count ${baseQuery}`, params, (err, countResult) => {

    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    const total = countResult[0].count;
    const totalPages = Math.ceil(total / limit);

    // Get paginated restaurants
    db.query(
      `
      SELECT r.*
      ${baseQuery}
      ORDER BY
        CASE
          WHEN r.name LIKE ? THEN 1
          ELSE 2
        END,
        r.name ASC
      LIMIT ? OFFSET ?
      `,
      [...params, `%${search || ""}%`, limit, offset],
      (err, results) => {

        if (err) {
          console.error(err);
          return res.status(500).json(err);
        }

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


// ================= GET SINGLE RESTAURANT =================

app.get("/api/restaurants/:id", (req, res) => {

  const id = req.params.id;

  db.query(
    "SELECT * FROM Restaurants WHERE id = ?",
    [id],
    (err, results) => {

      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }

      res.json(results[0]);
    }
  );
});


// ================= GET RESTAURANT MENU =================

app.get("/api/restaurants/:id/menu", (req, res) => {

  const id = req.params.id;

  db.query(
    `
    SELECT *
    FROM Menu_Items
    WHERE restaurant_id = ?
    ORDER BY category, name
    `,

    [id],
    (err, results) => {

      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }

      res.json(results);
    }
  );
});


// ================= SERVE REACT FRONTEND =================

app.use(express.static(path.join(__dirname, "../client/dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});


// ================= START SERVER =================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});