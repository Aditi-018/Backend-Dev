const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// In-memory student list
let students = [
  { id: 1, name: "Sona", marks: 85, grade: "A" },
  { id: 2, name: "Abhishek", marks: 45, grade: "C" },
  { id: 3, name: "Lakshita", marks: 30, grade: "F" }
];

// ---------------------
// ROUTES
// ---------------------

// GET /students → Show all students
app.get("/students", (req, res) => {
  res.render("students", { students });
});

// GET /students/:id → Show individual student
app.get("/students/:id", (req, res) => {
  const student = students.find(s => s.id == req.params.id);

  if (!student) {
    return res.send("Student not found");
  }

  res.render("student", { student });
});

// GET form
app.get("/add-student", (req, res) => {
  res.render("add-student");
});

// POST form
app.post("/add-student", (req, res) => {
  const { name, marks, grade } = req.body;

  students.push({
    id: students.length + 1,
    name,
    marks: Number(marks),
    grade
  });

  res.redirect("/students");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});