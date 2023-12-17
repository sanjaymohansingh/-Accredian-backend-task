// const express = require("express");
// const mysql = require("mysql");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "signup",
// });

// app.post("/signup", (req, res) => {
//   const sql =
//     "INSERT INTO login (`username`,`email`,`password`,`cpassword`) VALUES (?)";
//   const values = [
//     req.body.username,
//     req.body.email,
//     req.body.password,
//     req.body.cpassword,
//   ];
//   db.query(sql, [values], (err, data) => {
//     if (err) {
//       return res.json("Error");
//     }
//     return res.json(data);
//   });
// });

// app.post("/signin", (req, res) => {
//   const sql = "SELECT * FROM login WHERE `email` = ? AND `password` = ?";
//   db.query(sql, [req.body.email, req.body.password], (err, data) => {
//     if (err) {
//       return res.json("Error");
//     }
//     if (data.length > 0) {
//       return res.json("Success");
//     } else {
//       return res.json("Failed");
//     }
//   });
// });

// app.listen(5000, () => {
//   console.log("Server is Running");
// });
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "signup",
});

app.post("/signup", async (req, res) => {
  try {
    // Validate input
    const { username, email, password, cpassword } = req.body;
    if (!username || !email || !password || !cpassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email is already registered
    const emailExists = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM login WHERE email = ?",
        [email],
        (err, result) => {
          if (err) reject(err);
          else resolve(result.length > 0);
        }
      );
    });

    if (emailExists) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Hash the password and confirm password
    const hashedPassword = await bcrypt.hash(String(password), 10);
    const hashedCPassword = await bcrypt.hash(String(cpassword), 10);

    // Insert user into the database
    const sql =
      "INSERT INTO login (username, email, password, cpassword) VALUES (?, ?, ?, ?)";
    const values = [username, email, hashedPassword, hashedCPassword];

    db.query(sql, values, (err, data) => {
      if (err) {
        return handleDatabaseError(res, err);
      }
      return res.json({ success: true });
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/signin", (req, res) => {
  const sql = "SELECT * FROM login WHERE `email` = ? AND `password` = ?";
  db.query(sql, [req.body.email, req.body.password], (err, data) => {
    if (err) {
      return res.json("Error");
    }
    if (data.length > 0) {
      return res.json("Success");
    } else {
      return res.json("Failed");
    }
  });
});

app.listen(5000, () => {
  console.log("Server is Running");
});
