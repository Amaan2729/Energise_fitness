const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const auth = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create a new order
// Use auth middleware to optionally attach user from Bearer token
router.post("/", auth, async (req, res) => {
  try {
    const {
      firstName, lastName, address, city, state, zip,
      paymentMethod, products, totalPrice, card
    } = req.body;

    // Build order payload (do NOT store full card number or CVV)
    const orderData = {
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      paymentMethod,
      products,
      totalPrice,
      // you may attach user id if authenticated
    };

    // If client provided card object, safely extract non-sensitive fields
    if (paymentMethod === 'card' && card && typeof card.number === 'string') {
      const raw = card.number.replace(/\s+/g, '');
      // keep only last 4 digits
      orderData.cardLast4 = raw.slice(-4);
      if (card.expiry) orderData.cardExpiry = card.expiry;
      if (card.brand) orderData.cardBrand = card.brand;
    }

    const order = new Order(orderData);
    await order.save();

    // Never log or return full card info
    return res.status(201).json({ message: 'Order created', orderId: order._id });
  } catch (err) {
    console.error('Create order error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// Additional helper route: get current user's orders
// GET /api/orders/mine
router.get('/mine', auth, async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ message: 'Not authenticated' });
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error('❌ Error fetching user orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
