const express = require("express");
const app = express();

app.use(express.json()); // To parse JSON body

// ------------------
// Logger Middleware
// ------------------
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ------------------
// In-Memory Users Array
// ------------------
let users = [
  { id: 1, name: "Sona", email: "sona@gmail.com", role: "Admin" },
  { id: 2, name: "Abhishek", email: "abhishek@gmail.com", role: "User" }
];

// ------------------
// Validation Middleware (for POST)
// ------------------
const validateUser = (req, res, next) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  next();
};

// ------------------
// ROUTES
// ------------------

// GET /users → Fetch all users
app.get("/users", (req, res) => {
  res.json(users);
});

// GET /users/:id → Fetch user by ID
app.get("/users/:id", (req, res) => {
  const user = users.find(u => u.id == req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

// POST /users → Add new user
app.post("/users", validateUser, (req, res) => {
  const { name, email, role } = req.body;

  const newUser = {
    id: users.length + 1,
    name,
    email,
    role
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT /users/:id → Update user
app.put("/users/:id", (req, res) => {
  const user = users.find(u => u.id == req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { name, email, role } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;

  res.json(user);
});

// DELETE /users/:id → Remove user
app.delete("/users/:id", (req, res) => {
  const index = users.findIndex(u => u.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(index, 1);

  res.json({ message: "User deleted successfully" });
});

// ------------------
app.listen(3000, () => {
  console.log("Server running on port 3000");
});