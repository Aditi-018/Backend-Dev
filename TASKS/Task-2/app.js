const express = require("express");
const app = express();

app.use(express.json());

// ------------------------
// Predefined Users
// ------------------------
const users = [
  { id: 1, email: "sona@gmail.com", password: "1234", role: "Admin" },
  { id: 2, email: "abhishek@gmail.com", password: "abcd", role: "User" }
];

// Store active tokens
let tokens = [];

// ------------------------
// LOGIN ROUTE
// ------------------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Generate dummy token
  const token = "token-" + Date.now();

  tokens.push(token);

  res.json({
    message: "Login successful",
    token: token
  });
});

// ------------------------
// Authentication Middleware
// ------------------------
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - Token Missing" });
  }

  if (!tokens.includes(token)) {
    return res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }

  next();
};

// ------------------------
// Protected Routes
// ------------------------

app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to Dashboard (Protected)" });
});

app.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "User Profile Data (Protected)" });
});

// ------------------------
app.listen(3000, () => {
  console.log("Server running on port 3000");
});