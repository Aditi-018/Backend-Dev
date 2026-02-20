//Student Management System
const express = require("express");
const fs = require("fs");
const users = require("./MOCK_DATA.json");
const app = express();

app.use(express.urlencoded({ extended: false }));

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users", (req, res) => {
  const { first_name, last_name, email, gender, job_title } = req.body;
  const newUser = {
    id: users.length + 1,
    first_name,
    last_name,
    email,
    gender,
    job_title,
  };
  users.push(newUser);
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), () => {
    res.status(201).json({
      msg: "User Created Successfully",
      user: newUser,
    });
  });
});

app.patch("/api/users/:id", (req, res) => {
  const id = req.params.id;
  const userIndex = users.findIndex((u) => u.id == id);
  if (userIndex == -1) {
    return res.status(404).json({ msg: " User not found" });
  }
  users[userIndex] = {
    ...users[userIndex],
    ...req.body,
  };
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), () => {
    res.json({
      msg: "User Updated Successfully",
      user: users[userIndex],
    });
  });
});

app.delete("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = users.findIndex((u) => u.id == id);
  if (index == -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const deletedUser = users.splice(index, 1);

  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), () => {
    res.json({
      message: "User deleted successfully",
      user: deletedUser[0],
    });
  });
});

app.listen(8000, () => {
  console.log("Server Started");
});