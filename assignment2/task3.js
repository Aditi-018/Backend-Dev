const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(express.json());

// ------------------- MongoDB Connection -------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/userActivityDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ------------------- User Schema -------------------
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  loginTimes: [Date],     // Stores all login timestamps
  logoutTimes: [Date],    // Stores all logout timestamps
  lastActive: Date,       // Stores the last activity time
});

// ------------------- Mongoose Middleware -------------------

// Update lastActive automatically before saving
userSchema.pre("save", function (next) {
  this.lastActive = new Date();
  next();
});

const User = mongoose.model("User", userSchema);

// ------------------- Session Setup -------------------
app.use(
  session({
    secret: "mySecretKey123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 hour
      httpOnly: true,
    },
  })
);

// ------------------- Seed Dummy User (Run Once) -------------------
app.get("/seed", async (req, res) => {
  const existingUser = await User.findOne({ username: "admin" });
  if (!existingUser) {
    await User.create({
      username: "admin",
      password: "123",
      role: "admin",
      loginTimes: [],
      logoutTimes: [],
    });
    return res.send("Dummy user created");
  }
  res.send("User already exists");
});

// ------------------- Middleware to Update Last Active -------------------
const updateLastActive = async (req, res, next) => {
  if (req.session.user) {
    await User.findByIdAndUpdate(req.session.user.id, {
      lastActive: new Date(),
    });
  }
  next();
};

app.use(updateLastActive);

// ------------------- Login (Track Login Time) -------------------
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) {
    return res.status(401).json({ msg: "Invalid Credential" });
  }

  // Add login timestamp
  user.loginTimes.push(new Date());
  await user.save(); // Triggers pre("save") middleware

  req.session.user = {
    id: user._id,
    username: user.username,
    role: user.role,
  };

  res.json({
    msg: "Login Successful",
    sessionId: req.sessionID,
  });
});

// ------------------- Profile (Protected) -------------------
app.get("/profile", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      msg: "Please login first",
    });
  }

  const user = await User.findById(req.session.user.id);

  res.json({
    msg: "User Profile",
    user,
  });
});

// ------------------- Dashboard (Protected) -------------------
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      msg: "Unauthorized user",
    });
  }
  res.send(`Welcome ${req.session.user.username}`);
});

// ------------------- Logout (Track Logout Time) -------------------
app.get("/logout", async (req, res) => {
  if (req.session.user) {
    await User.findByIdAndUpdate(req.session.user.id, {
      $push: { logoutTimes: new Date() },
      lastActive: new Date(),
    });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.clearCookie("connect.sid"); // Default cookie name
    res.send("Logged Out Successfully");
  });
});

// ------------------- Check Session -------------------
app.get("/check-session", (req, res) => {
  if (req.session.user) {
    res.json({
      msg: "Session Active",
      user: req.session.user,
    });
  } else {
    res.json({
      msg: "No Active Session",
    });
  }
});

// ------------------- Get User Activity -------------------
app.get("/activity", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      msg: "Please login first",
    });
  }

  const user = await User.findById(req.session.user.id).select(
    "username loginTimes logoutTimes lastActive"
  );

  res.json({
    msg: "User Activity",
    activity: user,
  });
});

// ------------------- Start Server -------------------
app.listen(3000, () => {
  console.log("Server Started on http://localhost:3000");
});