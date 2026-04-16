const express = require('express');
const session = require('express-session');

const app = express();
app.use(express.json());

// Configure session middleware
app.use(
  session({
    secret: 'cart-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

/**
 * Initialize cart middleware
 * Ensures every session has a cart object
 */
const initCart = (req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = {
      items: [],
      totalQuantity: 0,
      totalPrice: 0,
    };
  }
  next();
};

// Apply middleware to all cart routes
app.use('/cart', initCart);

/**
 * Helper function to recalculate cart totals
 */
const calculateTotals = (cart) => {
  cart.totalQuantity = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  cart.totalPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
};

/**
 * Add item to cart
 * Body: { productId, name, price, quantity }
 */
app.post('/cart/add', (req, res) => {
  const { productId, name, price, quantity = 1 } = req.body;

  if (!productId || !name || price == null) {
    return res.status(400).json({
      message: 'productId, name, and price are required.',
    });
  }

  if (price < 0 || quantity <= 0) {
    return res.status(400).json({
      message: 'Price must be non-negative and quantity must be greater than 0.',
    });
  }

  const cart = req.session.cart;
  const existingItem = cart.items.find(
    (item) => item.productId === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      productId,
      name,
      price,
      quantity,
    });
  }

  calculateTotals(cart);

  res.status(200).json({
    message: 'Item added to cart.',
    cart,
  });
});

/**
 * Update item quantity
 * Params: productId
 * Body: { quantity }
 */
app.put('/cart/update/:productId', (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity == null || quantity < 0) {
    return res.status(400).json({
      message: 'Quantity must be a non-negative number.',
    });
  }

  const cart = req.session.cart;
  const itemIndex = cart.items.findIndex(
    (item) => item.productId === productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      message: 'Product not found in cart.',
    });
  }

  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  calculateTotals(cart);

  res.status(200).json({
    message: 'Cart updated successfully.',
    cart,
  });
});

/**
 * Remove item from cart
 * Params: productId
 */
app.delete('/cart/remove/:productId', (req, res) => {
  const { productId } = req.params;
  const cart = req.session.cart;

  const initialLength = cart.items.length;
  cart.items = cart.items.filter(
    (item) => item.productId !== productId
  );

  if (cart.items.length === initialLength) {
    return res.status(404).json({
      message: 'Product not found in cart.',
    });
  }

  calculateTotals(cart);

  res.status(200).json({
    message: 'Item removed from cart.',
    cart,
  });
});

/**
 * Get current cart
 */
app.get('/cart', (req, res) => {
  res.status(200).json(req.session.cart);
});

/**
 * Clear the entire cart
 */
app.delete('/cart/clear', (req, res) => {
  req.session.cart = {
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
  };

  res.status(200).json({
    message: 'Cart cleared successfully.',
    cart: req.session.cart,
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Shopping cart server running on http://localhost:3000');
});