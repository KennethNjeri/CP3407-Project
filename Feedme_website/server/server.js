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


// ================= AUTH =================

app.post("/api/register", (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  db.query(
    "SELECT user_id FROM Users WHERE email = ?",
    [email],
    (err, existingResults) => {
      if (err) {
        console.error("Error checking existing user:", err);
        return res.status(500).json({ message: "Server error during registration." });
      }

      if (existingResults.length > 0) {
        return res.status(409).json({ message: "Email already registered." });
      }

      db.query(
        `
        INSERT INTO Users (f_name, l_name, email, password, role)
        VALUES (?, ?, ?, ?, 'customer')
        `,
        [firstName, lastName, email, password],
        (err, insertResult) => {
          if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ message: "Server error during registration." });
          }

          db.query(
            `
            SELECT user_id, f_name, l_name, email, role
            FROM Users
            WHERE user_id = ?
            `,
            [insertResult.insertId],
            (err, userResults) => {
              if (err) {
                console.error("Error fetching new user:", err);
                return res.status(500).json({ message: "User created, but failed to fetch profile." });
              }

              res.status(201).json({
                message: "User registered successfully.",
                user: userResults[0],
              });
            }
          );
        }
      );
    }
  );
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  db.query(
    `
    SELECT user_id, f_name, l_name, email, password, role
    FROM Users
    WHERE email = ?
    `,
    [email],
    (err, results) => {
      if (err) {
        console.error("Error logging in:", err);
        return res.status(500).json({ message: "Server error during login." });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const user = results[0];

      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      res.json({
        message: "Login successful.",
        user: {
          user_id: user.user_id,
          f_name: user.f_name,
          l_name: user.l_name,
          email: user.email,
          role: user.role,
        },
      });
    }
  );
});


app.post("/api/change-password", (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters." });
  }

  db.query(
    "SELECT user_id, password FROM Users WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error finding user for password change:", err);
        return res.status(500).json({ message: "Server error while changing password." });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      const user = results[0];

      if (user.password !== currentPassword) {
        return res.status(401).json({ message: "Current password is incorrect." });
      }

      db.query(
        "UPDATE Users SET password = ? WHERE user_id = ?",
        [newPassword, userId],
        (err) => {
          if (err) {
            console.error("Error updating password:", err);
            return res.status(500).json({ message: "Server error while updating password." });
          }

          res.json({ message: "Password updated successfully." });
        }
      );
    }
  );
});

// ================= RESTAURANT SEARCH =================

app.get("/api/restaurants", (req, res) => {
  const search = (req.query.q || "").trim();
  const page = parsePositiveInt(req.query.page, 1);

  let limit = parsePositiveInt(req.query.limit, 20);
  if (limit > 50) limit = 50;

  if (search !== "" && search.length < 2) {
      return res.json({
        page: 1,
        totalPages: 0,
        totalRestaurants: 0,
        restaurants: []
      });
    }
  const offset = (page - 1) * limit;

  let baseQuery = "FROM Restaurants r";
  let params = [];

  if (search !== "") {
    baseQuery = `
      FROM Restaurants r
      WHERE r.name LIKE ?
    `;
    params = [`%${search}%`];
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
            ELSE 3
          END,
          r.name ASC
        LIMIT ? OFFSET ?
      `;

      restaurantParams.push(
        search,
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