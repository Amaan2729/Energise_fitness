const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      paymentMethod,
      products
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Products required" });
    }

    // calculate total on server (important for integrity)
    const totalPrice = products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );

    const order = new Order({
      user: req.user?.id || null,
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      paymentMethod,
      products,
      totalPrice,
      status: "pending"
    });

    await order.save();

    res.status(201).json({
      message: "Order created successfully",
      orderId: order._id
    });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
