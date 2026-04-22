const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

/* =========================
   DB CONNECT
========================= */
mongoose.connect('mongodb://127.0.0.1:27017/quickbank');

/* =========================
   SCHEMAS
========================= */
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  balance: { type: Number, default: 0 },
  resetToken: String,
  resetExpiry: Date
});

const transactionSchema = new mongoose.Schema({
  from: mongoose.Schema.Types.ObjectId,
  to: mongoose.Schema.Types.ObjectId,
  amount: Number,
  description: String,
  time: { type: Date, default: Date.now }
});

const auditSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  action: String,
  time: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Audit = mongoose.model('Audit', auditSchema);

/* =========================
   SESSION (SECURE)
========================= */
app.use(session({
  secret: 'bank-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 10 * 60 * 1000, // 10 min
    httpOnly: true
  }
}));

/* =========================
   SANITIZE
========================= */
function sanitize(input) {
  return String(input)
    .replace(/<script.*?>.*?<\/script>/gi, '')
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* =========================
   AUTH
========================= */
function isAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Login required' });
  }
  next();
}

/* =========================
   AUDIT LOG
========================= */
async function log(userId, action) {
  await Audit.create({ userId, action });
}

/* =========================
   RATE LIMIT (SIMPLE)
========================= */
let attempts = {};

function rateLimit(req, res, next) {
  const ip = req.ip;

  if (!attempts[ip]) attempts[ip] = 0;
  attempts[ip]++;

  if (attempts[ip] > 5) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  next();
}

/* =========================
   REGISTER
========================= */
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Weak password' });
  }

  const hash = await bcrypt.hash(password, 10);

  await User.create({
    username: sanitize(username),
    email,
    password: hash,
    balance: 10000 // demo balance
  });

  res.json({ message: 'Registered' });
});

/* =========================
   LOGIN
========================= */
app.post('/login', rateLimit, async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      await log(null, 'Failed login');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.userId = user._id;

    await log(user._id, 'Login');

    res.json({ message: 'Login successful' });

  } catch {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

/* =========================
   CHECK BALANCE
========================= */
app.get('/balance', isAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);

  res.json({ balance: user.balance });
});

/* =========================
   TRANSFER MONEY
========================= */
app.post('/transfer', isAuth, async (req, res) => {
  try {
    const { toUserId, amount, description } = req.body;

    // Validate amount
    if (amount <= 0 || amount > 100000) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const sender = await User.findById(req.session.userId);
    const receiver = await User.findById(toUserId);

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // 2FA simulation for >1000
    if (amount > 1000 && !req.session.verified2FA) {
      req.session.tempTransfer = { toUserId, amount, description };
      return res.json({ message: '2FA required (use /verify-2fa)' });
    }

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    await Transaction.create({
      from: sender._id,
      to: receiver._id,
      amount,
      description: sanitize(description)
    });

    await log(sender._id, 'Transfer money');

    res.json({ message: 'Transfer successful' });

  } catch {
    res.status(500).json({ error: 'Transaction failed' });
  }
});

/* =========================
   VERIFY 2FA
========================= */
app.post('/verify-2fa', isAuth, (req, res) => {
  req.session.verified2FA = true;

  res.json({ message: '2FA verified, retry transfer' });
});

/* =========================
   TRANSACTION HISTORY (SAFE)
========================= */
app.get('/transactions', isAuth, async (req, res) => {
  const tx = await Transaction.find({
    from: req.session.userId
  });

  res.json(tx);
});

/* =========================
   PASSWORD RESET
========================= */
app.post('/reset-request', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.json({ message: 'If exists, email sent' });

  user.resetToken = Math.random().toString(36);
  user.resetExpiry = Date.now() + 10 * 60 * 1000; // 10 min

  await user.save();

  res.json({ token: user.resetToken }); // simulate email
});

/* =========================
   RESET PASSWORD
========================= */
app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({ resetToken: token });

  if (!user || user.resetExpiry < Date.now()) {
    return res.status(400).json({ error: 'Invalid/expired token' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = null;

  await user.save();

  res.json({ message: 'Password updated' });
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
   SERVER
========================= */
app.listen(3000, () => {
  console.log('QuickBank running on port 3000');
});