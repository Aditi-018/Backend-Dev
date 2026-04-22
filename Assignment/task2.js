const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const validator = require('validator');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
app.use(express.json());

/* =========================
   DB CONNECTION
========================= */
mongoose.connect('mongodb://localhost:27017/connecthub');

/* =========================
   GLOBAL SECURITY
========================= */
app.use(mongoSanitize());

// Trim inputs
app.use((req, res, next) => {
  ['body', 'query', 'params'].forEach(key => {
    if (req[key]) {
      Object.keys(req[key]).forEach(field => {
        if (typeof req[key][field] === 'string') {
          req[key][field] = req[key][field].trim();
        }
      });
    }
  });
  next();
});

// Basic CSP
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self';"
  );
  next();
});

/* =========================
   SESSION
========================= */
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 30 // 30 min
  }
}));

/* =========================
   SCHEMAS
========================= */
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  bio: String,
  profileUrl: String
});

const postSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  content: String
});

const messageSchema = new mongoose.Schema({
  from: mongoose.Schema.Types.ObjectId,
  to: mongoose.Schema.Types.ObjectId,
  text: String
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Message = mongoose.model('Message', messageSchema);

/* =========================
   SANITIZATION FUNCTIONS
========================= */

// User
function sanitizeUser(data) {
  return {
    username: validator.escape(data.username || ''),
    email: validator.isEmail(data.email) ? validator.normalizeEmail(data.email) : null,
    bio: validator.escape((data.bio || '').substring(0, 200)),
    profileUrl: validator.isURL(data.profileUrl || '', {
      protocols: ['http', 'https'],
      require_protocol: true
    }) ? data.profileUrl : ''
  };
}

// Text (messages/comments)
function sanitizeText(text) {
  return validator.escape(text || '');
}

/* =========================
   AUTH MIDDLEWARE
========================= */
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Login required' });
  }
  next();
}

/* =========================
   REGISTER
========================= */
app.post('/register', async (req, res) => {
  try {
    const data = sanitizeUser(req.body);

    if (!data.email) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const hashedPassword = await require('bcrypt').hash(req.body.password, 10);

    const user = await User.create({
      ...data,
      password: hashedPassword
    });

    res.json({ message: 'Registered' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

/* =========================
   LOGIN
========================= */
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user || !(await require('bcrypt').compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.regenerate(() => {
    req.session.userId = user._id;
    res.json({ message: 'Login successful' });
  });
});

/* =========================
   CREATE POST
========================= */
app.post('/posts', requireAuth, async (req, res) => {
  // Escape everything (no HTML allowed safely without DOMPurify)
  const safeContent = validator.escape(req.body.content || '');

  const post = await Post.create({
    userId: req.session.userId,
    content: safeContent
  });

  res.json(post);
});

/* =========================
   GET POSTS
========================= */
app.get('/posts', async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

/* =========================
   SEND MESSAGE
========================= */
app.post('/message', requireAuth, async (req, res) => {
  const text = sanitizeText(req.body.text);

  const msg = await Message.create({
    from: req.session.userId,
    to: req.body.to,
    text
  });

  res.json(msg);
});

/* =========================
   PROFILE
========================= */
app.get('/profile', requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);

  res.json({
    username: user.username,
    bio: user.bio
  });
});

/* =========================
   LOGOUT
========================= */
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

/* =========================
   START
========================= */
app.listen(3000, () => {
  console.log('Secure server running on port 3000');
});