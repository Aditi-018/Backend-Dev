const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware to parse JSON
app.use(express.json());

// ------------------- Request Logging Middleware -------------------
const logFilePath = path.join(__dirname, "requests.log");

app.use((req, res, next) => {
  const start = Date.now();

  // Execute after the response is sent
  res.on("finish", () => {
    const responseTime = Date.now() - start;

    const log = `${new Date().toISOString()} | ${req.method} | ${
      req.originalUrl
    } | ${res.statusCode} | ${responseTime}ms\n`;

    fs.appendFile(logFilePath, log, (err) => {
      if (err) {
        console.error("Error writing log:", err);
      }
    });
  });

  next();
});
// ------------------------------------------------------------------

// Session setup
app.use(
  session({
    secret: "mySecretKey123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 hour
      httpOnly: true,
    },
  })
);

// ------------------- Routes -------------------

// Login (Create Session)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Dummy Authentication
  if (username === "admin" && password === "123") {
    req.session.user = {
      username: username,
      role: "admin",
    };
    return res.json({
      msg: "Login Successful",
      sessionId: req.sessionID,
    });
  }
  res.status(401).json({ msg: "Invalid Credential" });
});

// Profile (Protected)
app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      msg: "Please login first",
    });
  }
  res.json({
    msg: "User Profile",
    user: req.session.user,
  });
});

// Dashboard (Protected)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      msg: "Unauthorized user",
    });
  }
  res.send(`Welcome ${req.session.user.username}`);
});

// Logout (Destroy Session)
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.clearCookie("connect.sid"); // Default cookie name
    res.send("Logged Out Successfully");
  });
});

// Check Session
app.get("/check-session", (req, res) => {
  if (req.session.user) {
    res.json({
      msg: "Session Active",
      user: req.session.user,
    });
  } else {
    res.json({
      msg: "No Active Session",
    });
  }
});

// Start Server
app.listen(3000, () => {
  console.log("Server Started on http://localhost:3000");
});