const express = require("express");
const app = express();


app.use(express.json());


app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});


let users = [
  { id: 1, name: "Aman", email: "aman@gmail.com", role: "admin" },
  { id: 2, name: "Naman", email: "naman@gmail.com", role: "user" },
];


const validateUser = (req, res, next) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({
      message: "Invalid input. name, email and role are required",
    });
  }

  next();
};


/* GET — Fetch all users */
app.get("/users", (req, res) => {
  res.json(users);
});

/* GET — Fetch user by ID */
app.get("/users/:id", (req, res) => {
  const id = req.params.id;
  const user = users.find((u) => u.id == id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

/* POST — Add new user */
app.post("/users", validateUser, (req, res) => {
  const { name, email, role } = req.body;

  const newUser = {
    id: users.length + 1,
    name,
    email,
    role,
  };

  users.push(newUser);
  res.status(201).json({
    message: "User added successfully",
    user: newUser,
  });
});


app.put("/users/:id", (req, res) => {
  const id = req.params.id;
  const user = users.find((u) => u.id == id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { name, email, role } = req.body;

  if (!name && !email && !role) {
    return res.status(400).json({
      message: "At least one field is required to update",
    });
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;

  res.json({
    message: "User updated successfully",
    user,
  });
});


app.delete("/users/:id", (req, res) => {
  const id = req.params.id;
  const index = users.findIndex((u) => u.id == id);

  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const deletedUser = users.splice(index, 1);

  res.json({
    message: "User deleted successfully",
    user: deletedUser[0],
  });
});


app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: "Internal Server Error" });
});


app.listen(8000, () => {
  console.log("Server Started on port 8000");
});