const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.json());

// Session configuration
app.use(
  session({
    secret: 'auth-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
  })
);

// In-memory data stores (replace with a real database in production)
const users = [
  { id: 1, username: 'user1', role: 'user' },
  { id: 2, username: 'moderator1', role: 'moderator' },
  { id: 3, username: 'admin1', role: 'admin' }
];

const posts = [];
let postIdCounter = 1;

const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      message: 'Authentication required. Please log in.'
    });
  }
  next();
};

/* ============================================================
   Role-Based Authorization Middleware
   ============================================================ */
const requireRole = (role) => {
  const roleHierarchy = {
    user: 1,
    moderator: 2,
    admin: 3
  };

  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({
        message: 'Authentication required.'
      });
    }

    const userRole = req.session.user.role;

    if (roleHierarchy[userRole] >= roleHierarchy[role]) {
      return next();
    }

    return res.status(403).json({
      message: `Access denied. ${role} role or higher required.`
    });
  };
};

/* ============================================================
   Resource Ownership or Moderator/Admin Check
   ============================================================ */
const isOwnerOrModerator = (req, res, next) => {
  const postId = parseInt(req.params.id);
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).json({
      message: 'Post not found.'
    });
  }

  const currentUser = req.session.user;

  if (
    post.authorId === currentUser.id ||
    currentUser.role === 'moderator' ||
    currentUser.role === 'admin'
  ) {
    req.post = post; // Attach post to request for later use
    return next();
  }

  return res.status(403).json({
    message: 'You are not authorized to modify this post.'
  });
};

/* ============================================================
   Authentication Routes (for testing)
   ============================================================ */

// Simple login route (no password for demo purposes)
app.post('/login', (req, res) => {
  const { username } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(404).json({
      message: 'User not found.'
    });
  }

  req.session.user = user;

  res.status(200).json({
    message: 'Login successful.',
    user
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: 'Logged out successfully.' });
  });
});

/* ============================================================
   Post Routes
   ============================================================ */

// Create a new post
app.post('/posts', isAuthenticated, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      message: 'Title and content are required.'
    });
  }

  const newPost = {
    id: postIdCounter++,
    title,
    content,
    authorId: req.session.user.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  posts.push(newPost);

  res.status(201).json({
    message: 'Post created successfully.',
    post: newPost
  });
});

// Update a post (owner, moderator, or admin)
app.put('/posts/:id', isAuthenticated, isOwnerOrModerator, (req, res) => {
  const { title, content } = req.body;

  if (!title && !content) {
    return res.status(400).json({
      message: 'At least one of title or content must be provided.'
    });
  }

  if (title) req.post.title = title;
  if (content) req.post.content = content;
  req.post.updatedAt = new Date();

  res.status(200).json({
    message: 'Post updated successfully.',
    post: req.post
  });
});

// Delete a post (moderator or admin)
app.delete(
  '/posts/:id',
  isAuthenticated,
  requireRole('moderator'),
  (req, res) => {
    const postId = parseInt(req.params.id);
    const index = posts.findIndex((p) => p.id === postId);

    if (index === -1) {
      return res.status(404).json({
        message: 'Post not found.'
      });
    }

    const deletedPost = posts.splice(index, 1)[0];

    res.status(200).json({
      message: 'Post deleted successfully.',
      post: deletedPost
    });
  }
);

/* ============================================================
   Admin Routes - User Management
   ============================================================ */

// Get all users (admin only)
app.get('/users', isAuthenticated, requireRole('admin'), (req, res) => {
  res.status(200).json(users);
});

// Update a user's role (admin only)
app.put(
  '/users/:id/role',
  isAuthenticated,
  requireRole('admin'),
  (req, res) => {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    const validRoles = ['user', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role specified.'
      });
    }

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    user.role = role;

    res.status(200).json({
      message: 'User role updated successfully.',
      user
    });
  }
);

// Delete a user (admin only)
app.delete(
  '/users/:id',
  isAuthenticated,
  requireRole('admin'),
  (req, res) => {
    const userId = parseInt(req.params.id);
    const index = users.findIndex((u) => u.id === userId);

    if (index === -1) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    const deletedUser = users.splice(index, 1)[0];

    res.status(200).json({
      message: 'User deleted successfully.',
      user: deletedUser
    });
  }
);


app.listen(3000, () => {
  console.log('Authorization server running on http://localhost:3000');
});