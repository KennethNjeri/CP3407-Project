require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 80;

// ================= DATABASE =================

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
    connection.release();
  }
});

// ================= Helper =================

function parsePositiveInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

// ================= RESTAURANT SEARCH =================

app.get("/api/restaurants", (req, res) => {
  const search = (req.query.q || "").trim();
  const page = parsePositiveInt(req.query.page, 1);

  let limit = parsePositiveInt(req.query.limit, 20);
  if (limit > 50) limit = 50;

  const offset = (page - 1) * limit;

  let baseQuery = "FROM Restaurants r";
  let params = [];

  if (search !== "") {
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

  db.query(`SELECT COUNT(*) AS count ${baseQuery}`, params, (err, countResult) => {
    if (err) {
      console.error("Error counting restaurants:", err);
      return res.status(500).json({ error: "Server error while counting restaurants" });
    }

    const total = countResult[0].count;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    let restaurantQuery = `
      SELECT
        r.id,
        r.position,
        r.name,
        r.score,
        r.ratings,
        r.category,
        r.price_range,
        r.full_address,
        r.zip_code,
        r.lat,
        r.lng
      ${baseQuery}
    `;

    let restaurantParams = [...params];

    if (search !== "") {
      restaurantQuery += `
        ORDER BY
          CASE
            WHEN LOWER(r.name) = LOWER(?) THEN 1
            WHEN LOWER(r.name) LIKE LOWER(?) THEN 2
            WHEN LOWER(r.name) LIKE LOWER(?) THEN 3
            WHEN LOWER(r.category) LIKE LOWER(?) THEN 4
            ELSE 5
          END,
          r.name ASC
        LIMIT ? OFFSET ?
      `;

      restaurantParams.push(
        search,
        `${search}%`,
        `%${search}%`,
        `${search}%`,
        limit,
        offset
      );
    } else {
      restaurantQuery += `
        ORDER BY r.name ASC
        LIMIT ? OFFSET ?
      `;

      restaurantParams.push(limit, offset);
    }

    db.query(restaurantQuery, restaurantParams, (err, results) => {
      if (err) {
        console.error("Error fetching restaurants:", err);
        return res.status(500).json({ error: "Server error while fetching restaurants" });
      }

      res.json({
        page,
        totalPages,
        totalRestaurants: total,
        restaurants: results
      });
    });
  });
});

// ================= GET SINGLE RESTAURANT =================

app.get("/api/restaurants/:id", (req, res) => {
  const id = parsePositiveInt(req.params.id, 0);

  if (id === 0) {
    return res.status(400).json({ error: "Invalid restaurant id" });
  }

  db.query(
    `
    SELECT
      id,
      position,
      name,
      score,
      ratings,
      category,
      price_range,
      full_address,
      zip_code,
      lat,
      lng
    FROM Restaurants
    WHERE id = ?
    `,
    [id],
    (err, results) => {
      if (err) {
        console.error("Error fetching restaurant:", err);
        return res.status(500).json({ error: "Server error while fetching restaurant" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      res.json(results[0]);
    }
  );
});

// ================= GET RESTAURANT MENU =================

app.get("/api/restaurants/:id/menu", (req, res) => {
  const id = parsePositiveInt(req.params.id, 0);

  if (id === 0) {
    return res.status(400).json({ error: "Invalid restaurant id" });
  }

  db.query(
    `
    SELECT
      id,
      restaurant_id,
      category,
      name,
      description,
      price
    FROM Menu_Items
    WHERE restaurant_id = ?
    ORDER BY category ASC, name ASC
    `,
    [id],
    (err, results) => {
      if (err) {
        console.error("Error fetching menu:", err);
        return res.status(500).json({ error: "Server error while fetching menu" });
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