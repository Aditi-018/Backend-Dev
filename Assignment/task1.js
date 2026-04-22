const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

/* =========================
   MongoDB Connection
========================= */
mongoose.connect('mongodb://localhost:27017/sessiondb');

/* =========================
   User Schema
========================= */
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', userSchema);

/* =========================
   Session (NO MongoStore)
========================= */
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

/* =========================
   Register
========================= */
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword
    });

    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* =========================
   Login (Remember Me)
========================= */
app.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;

    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Session error' });

      req.session.userId = user._id;
      req.session.username = user.username;

      // Remember Me logic
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 day
      }

      res.json({ message: 'Login successful' });
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* =========================
   Profile (Protected)
========================= */
app.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Login required' });
  }

  res.json({
    userId: req.session.userId,
    username: req.session.username
  });
});

/* =========================
   Logout
========================= */
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logout successful' });
  });
});

/* =========================
   Start Server
========================= */
app.listen(3000, () => {
  console.log('Server running on port 3000');
});