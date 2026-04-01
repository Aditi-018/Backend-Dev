const express = require("express");
const mongoose = require("mongoose");

const app = express();

// CONNECT TO DATABASE

mongoose
  .connect("mongodb://localhost:27017/studentDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Mongo Error", err));


// SCHEMA

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    age: {
      type: Number,
    },
    gpa: {
      type: Number,
    },
  },
  { timestamps: true }
);

// MODEL
const Student = mongoose.model("Student", studentSchema);


// ==========================
// MIDDLEWARE
// ==========================
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// ==========================
// ROUTES (CRUD)
// ==========================

// READ (HTML)
app.get("/students", async (req, res) => {
  const allStudents = await Student.find({});

  const html = `
    <ul>
      ${allStudents
        .map((s) => `<li>${s.name} - ${s.email}</li>`)
        .join("")}
    </ul>
  `;

  res.send(html);
});


// READ (JSON)
app.get("/api/students", async (req, res) => {
  const allStudents = await Student.find({});
  res.json(allStudents);
});


// CREATE
app.post("/api/students", async (req, res) => {
  const body = req.body;

  if (!body || !body.name || !body.email) {
    return res.status(400).json({ message: "Name and Email required" });
  }

  const result = await Student.create({
    name: body.name,
    email: body.email,
    age: body.age,
    gpa: body.gpa,
  });

  return res.status(201).json({
    message: "Student created successfully",
    student: result,
  });
});


// UPDATE
app.patch("/api/students/:id", async (req, res) => {
  await Student.findByIdAndUpdate(req.params.id, {
    gpa: req.body.gpa || 4.0,
  });

  return res.json({ msg: "Student updated Successfully" });
});


// DELETE
app.delete("/api/students/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);

  return res.json({ msg: "Student deleted Successfully" });
});

app.listen(8000, () => {
  console.log("Server Started");
});