const express = require('express');
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const app = express();
app.use(express.json());

const JWT_SECRET = 'jwt-secret';

// In-memory user store (replace with a database in production)
const users = [
  {
    id: 1,
    username: 'john',
    // Password: SecurePass123!
    password: '$2b$10$wH8QwZ0pQfM9vDOMkMt2.e7NmBGG99nmHn7fO3O5OVwOB1p5MNDo6',
    role: 'user'
  }
];

app.use(
  session({
    secret: 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  if (!user) {
    return done(new Error('User not found'), null);
  }
  done(null, user);
});

passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username, password, done) => {
      try {
        const user = users.find((u) => u.username === username);
        if (!user) {
          return done(null, false, { message: 'Invalid username or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid username or password.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET
    },
    (payload, done) => {
      try {
        const user = users.find((u) => u.id === payload.id);
        if (!user) {
          return done(null, false, { message: 'User not found.' });
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
function generateJwtToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function ensureSessionAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized. Please log in.' });
}
// Session-based login using Local Strategy
app.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error.', error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Login failed.' });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Session login failed.' });
      }
      return res.status(200).json({
        message: 'Session-based login successful.',
        user: { id: user.id, username: user.username, role: user.role }
      });
    });
  })(req, res, next);
});

// API login that returns a JWT
app.post('/auth/api-login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error.', error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Login failed.' });
    }

    const token = generateJwtToken(user);
    return res.status(200).json({
      message: 'JWT login successful.',
      token
    });
  })(req, res, next);
});

// Logout (for session-based authentication)
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed.' });
    }
    req.session.destroy(() => {
      res.status(200).json({ message: 'Logged out successfully.' });
    });
  });
});


// Session-protected route
app.get('/dashboard', ensureSessionAuth, (req, res) => {
  res.status(200).json({
    message: 'Welcome to your dashboard!',
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

// JWT-protected API route
app.get(
  '/api/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.status(200).json({
      message: 'Profile retrieved successfully.',
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      }
    });
  }
);

// Route to switch between authentication methods
app.get('/auth/methods', (req, res) => {
  res.status(200).json({
    message: 'Available authentication methods.',
    methods: {
      sessionAuth: {
        login: 'POST /auth/login',
        protectedRoute: 'GET /dashboard'
      },
      jwtAuth: {
        login: 'POST /auth/api-login',
        protectedRoute: 'GET /api/profile'
      }
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: 'Internal server error.',
    error: err.message
  });
});

app.listen(3000, () => {
  console.log('Passport authentication server running on http://localhost:3000');
});