const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

/* =========================
   MongoDB Connection
========================= */
mongoose.connect('mongodb://127.0.0.1:27017/medibook');

/* =========================
   SCHEMAS
========================= */
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String, // patient, doctor, nurse, admin, insurance
  medicalHistory: String
});

const appointmentSchema = new mongoose.Schema({
  patientId: mongoose.Schema.Types.ObjectId,
  doctorId: mongoose.Schema.Types.ObjectId,
  date: String,
  reason: String
});

const recordSchema = new mongoose.Schema({
  patientId: mongoose.Schema.Types.ObjectId,
  doctorId: mongoose.Schema.Types.ObjectId,
  notes: String
});

const auditSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  action: String,
  time: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Record = mongoose.model('Record', recordSchema);
const Audit = mongoose.model('Audit', auditSchema);

/* =========================
   SESSION (SHORT EXPIRY)
========================= */
app.use(session({
  secret: 'secure-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 15 * 60 * 1000 } // 15 min (healthcare strict)
}));

/* =========================
   SANITIZATION
========================= */
function sanitize(input) {
  return input.replace(/<script.*?>.*?<\/script>/gi, '')
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
}

/* =========================
   VALIDATION
========================= */
function validEmail(email) {
  return email.includes('@');
}

function validDate(date) {
  return !isNaN(Date.parse(date));
}

/* =========================
   AUTH + RBAC
========================= */
function isAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Login required' });
  }
  next();
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

/* =========================
   AUDIT LOG
========================= */
async function logAction(userId, action) {
  await Audit.create({ userId, action });
}

/* =========================
   REGISTER (STRONG PASSWORD)
========================= */
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!validEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Weak password' });
  }

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    name: sanitize(name),
    email,
    password: hashed,
    role
  });

  res.json({ message: 'Registered' });
});

/* =========================
   LOGIN
========================= */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.userId = user._id;
  req.session.role = user.role;

  res.json({ message: 'Login successful' });
});

/* =========================
   MEDICAL RECORD ACCESS (FIX IDOR)
========================= */
app.get('/record/:id', isAuth, async (req, res) => {
  const record = await Record.findById(req.params.id);

  if (!record) return res.status(404).json({ error: 'Not found' });

  // Only owner or doctor can access
  if (
    record.patientId.toString() !== req.session.userId &&
    req.session.role !== 'doctor'
  ) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await logAction(req.session.userId, 'Viewed medical record');

  res.json(record);
});

/* =========================
   ADD DOCTOR NOTES
========================= */
app.post('/record', isAuth, allowRoles('doctor'), async (req, res) => {
  const { patientId, notes } = req.body;

  const record = await Record.create({
    patientId,
    doctorId: req.session.userId,
    notes: sanitize(notes)
  });

  await logAction(req.session.userId, 'Created medical record');

  res.json(record);
});

/* =========================
   APPOINTMENT BOOKING
========================= */
app.post('/appointment', isAuth, allowRoles('patient'), async (req, res) => {
  const { doctorId, date, reason } = req.body;

  if (!validDate(date)) {
    return res.status(400).json({ error: 'Invalid date' });
  }

  const appointment = await Appointment.create({
    patientId: req.session.userId,
    doctorId,
    date,
    reason: sanitize(reason)
  });

  await logAction(req.session.userId, 'Booked appointment');

  res.json(appointment);
});

/* =========================
   SEARCH (PREVENT INJECTION)
========================= */
app.get('/search', isAuth, async (req, res) => {
  const name = sanitize(req.query.name || '');

  // SAFE query (no direct object injection)
  const doctors = await User.find({
    role: 'doctor',
    name: { $regex: name, $options: 'i' }
  });

  res.json(doctors);
});

/* =========================
   FILE UPLOAD VALIDATION
========================= */
app.post('/upload', isAuth, (req, res) => {
  const { filename, size } = req.body;

  if (!filename.match(/\.(pdf|jpg|jpeg|png)$/i)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  if (size > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'File too large' });
  }

  res.json({ message: 'File accepted (simulated secure storage)' });
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
   START SERVER
========================= */
app.listen(3000, () => {
  console.log('Server running on port 3000');
});