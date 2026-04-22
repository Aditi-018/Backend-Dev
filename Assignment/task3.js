const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

/* =========================
   MongoDB Connection
========================= */
mongoose.connect('mongodb://127.0.0.1:27017/edulearn');

/* =========================
   User Schema (Roles)
========================= */
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, enum: ['student', 'instructor', 'admin'] },
  mfaCode: String
});

const User = mongoose.model('User', userSchema);

/* =========================
   Course Schema
========================= */
const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructorId: mongoose.Schema.Types.ObjectId
});

const Course = mongoose.model('Course', courseSchema);

/* =========================
   Quiz Schema
========================= */
const quizSchema = new mongoose.Schema({
  question: String,
  answer: String,
  submitted: Boolean,
  studentId: mongoose.Schema.Types.ObjectId
});

const Quiz = mongoose.model('Quiz', quizSchema);

/* =========================
   Session Config
========================= */
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

/* =========================
   SIMPLE INPUT SANITIZATION
========================= */
function sanitize(input) {
  return input.replace(/<script.*?>.*?<\/script>/gi, '')
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
}

/* =========================
   AUTH MIDDLEWARE
========================= */
function isAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Login required' });
  }
  next();
}

function isInstructor(req, res, next) {
  if (req.session.role !== 'instructor') {
    return res.status(403).json({ error: 'Instructor only' });
  }
  next();
}

/* =========================
   REGISTER
========================= */
app.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  // basic validation
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    username: sanitize(username),
    email,
    password: hashed,
    role
  });

  res.json({ message: 'Registered' });
});

/* =========================
   LOGIN + MFA (Simple)
========================= */
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // simple MFA for instructor
  if (user.role === 'instructor') {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.mfaCode = code;
    await user.save();

    return res.json({ message: 'Enter MFA code', code }); // (simulate sending)
  }

  req.session.userId = user._id;
  req.session.role = user.role;

  res.json({ message: 'Login success' });
});

/* =========================
   VERIFY MFA
========================= */
app.post('/verify-mfa', async (req, res) => {
  const { username, code } = req.body;

  const user = await User.findOne({ username });

  if (user.mfaCode !== code) {
    return res.status(400).json({ error: 'Invalid MFA' });
  }

  req.session.userId = user._id;
  req.session.role = user.role;

  user.mfaCode = null;
  await user.save();

  res.json({ message: 'MFA success' });
});

/* =========================
   CREATE COURSE
========================= */
app.post('/course', isAuth, isInstructor, async (req, res) => {
  const { title, description } = req.body;

  await Course.create({
    title: sanitize(title),
    description: sanitize(description),
    instructorId: req.session.userId
  });

  res.json({ message: 'Course created' });
});

/* =========================
   VIEW COURSES
========================= */
app.get('/courses', async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

/* =========================
   QUIZ SUBMISSION (LOCK AFTER SUBMIT)
========================= */
app.post('/quiz', isAuth, async (req, res) => {
  const { question, answer } = req.body;

  const existing = await Quiz.findOne({
    studentId: req.session.userId,
    question
  });

  if (existing && existing.submitted) {
    return res.status(400).json({ error: 'Already submitted' });
  }

  await Quiz.create({
    question: sanitize(question),
    answer: sanitize(answer),
    submitted: true,
    studentId: req.session.userId
  });

  res.json({ message: 'Quiz submitted' });
});

/* =========================
   FILE UPLOAD (BASIC CHECK)
========================= */
app.post('/upload', (req, res) => {
  const { filename } = req.body;

  if (!filename.endsWith('.pdf') && !filename.endsWith('.mp4')) {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  res.json({ message: 'File accepted (simulated)' });
});

/* =========================
   RATE LIMIT (SIMPLE)
========================= */
let loginAttempts = {};

app.post('/secure-login', (req, res, next) => {
  const ip = req.ip;

  if (!loginAttempts[ip]) loginAttempts[ip] = 0;

  loginAttempts[ip]++;

  if (loginAttempts[ip] > 5) {
    return res.status(429).json({ error: 'Too many attempts' });
  }

  next();
});

/* =========================
   START SERVER
========================= */
app.listen(3000, () => {
  console.log('Server running on port 3000');
});