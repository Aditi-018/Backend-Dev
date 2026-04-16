const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// In-memory database (replace with a real DB in production)
const users = [];

/**
 * Validate password strength
 * @param {string} password
 * @returns {Array} Array of validation error messages
 */
function validatePassword(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number.');
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=~`]/.test(password)) {
    errors.push('Password must contain at least one special character.');
  }

  return errors;
}

/**
 * Registration Endpoint
 */
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Username, email, and password are required.'
      });
    }

    // Prevent duplicate email registrations
    const existingUser = users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );
    if (existingUser) {
      return res.status(409).json({
        message: 'A user with this email already exists.'
      });
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: 'Password validation failed.',
        errors: passwordErrors
      });
    }

    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create and store the user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(newUser);

    // Respond with success (excluding password)
    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Internal server error.'
    });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});