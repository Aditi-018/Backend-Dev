const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const app = express();

// Middleware
app.use(express.json());

// Session setup
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

// Helper function to generate a 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// ------------------- Login (Create Session + Generate OTP) -------------------
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Dummy Authentication
  if (username === "admin" && password === "123") {
    req.session.user = {
      username: username,
      role: "admin",
    };

    // Generate OTP for MFA
    const otp = generateOTP();
    req.session.otp = otp;
    req.session.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    req.session.isMfaVerified = false;

    console.log(`OTP for ${username}: ${otp}`); // For testing only

    return res.json({
      msg: "Login Successful. OTP sent for verification.",
      sessionId: req.sessionID,
      otp: otp, // Remove this in production
    });
  }

  res.status(401).json({ msg: "Invalid Credential" });
});

// ------------------- Verify OTP -------------------
app.post("/verify-otp", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      msg: "Please login first",
    });
  }

  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      msg: "OTP is required",
    });
  }

  if (
    req.session.otp === otp &&
    Date.now() < req.session.otpExpires
  ) {
    req.session.isMfaVerified = true;

    // Clear OTP after successful verification
    delete req.session.otp;
    delete req.session.otpExpires;

    return res.json({
      msg: "OTP verification successful",
    });
  }

  res.status(401).json({
    msg: "Invalid or expired OTP",
  });
});

// ------------------- Middleware: Require MFA for Sensitive Routes -------------------
const requireMFA = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      msg: "Please login first",
    });
  }

  if (!req.session.isMfaVerified) {
    return res.status(403).json({
      msg: "OTP verification required for this operation",
    });
  }

  next();
};

// ------------------- Profile (Protected - Session Only) -------------------
app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      msg: "Please login first",
    });
  }
  res.json({
    msg: "User Profile",
    user: req.session.user,
  });
});

// ------------------- Dashboard (Protected - Session Only) -------------------
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      msg: "Unauthorized user",
    });
  }
  res.send(`Welcome ${req.session.user.username}`);
});

// ------------------- Sensitive Route (Requires MFA) -------------------
app.post("/transfer-funds", requireMFA, (req, res) => {
  res.json({
    msg: `Sensitive operation successful for ${req.session.user.username}`,
  });
});

// ------------------- Logout (Destroy Session) -------------------
app.get("/logout", (req, res) => {
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
      mfaVerified: req.session.isMfaVerified || false,
    });
  } else {
    res.json({
      msg: "No Active Session",
    });
  }
});

// Start Server
app.listen(3000, () => {
  console.log("Server Started on" )
});