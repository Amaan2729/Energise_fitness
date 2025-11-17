const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Subscription = require("../models/subscription");
const { cacheGet, cacheSet } = require("../utils/redisHelpers");

/* --------------------------------------
   GET ALL PLANS (with Redis caching)
-------------------------------------- */
router.get("/plans", async (req, res) => {
  try {
    const cacheKey = "plans:all";
    let cached = null;

    try {
      cached = await cacheGet(cacheKey);
    } catch (err) {
      console.warn("[redis] cacheGet failed:", err?.message);
    }

    if (cached) return res.json({ plans: cached, cache: true });

    const plans = [
      { name: "Basic", price: 6500, description: "Access to standard workout plans and gym facilities." },
      { name: "Premium", price: 7500, description: "Includes personalized training plans and nutrition guidance." },
      { name: "Ultimate", price: 8500, description: "All-inclusive access with premium support and exclusive events." }
    ];

    try {
      await cacheSet(cacheKey, plans, 86400);
    } catch (err) {
      console.warn("[redis] cacheSet failed:", err?.message);
    }

    return res.json({ plans, cache: false });
  } catch (err) {
    console.error("Error fetching plans:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* --------------------------------------
   CREATE SUBSCRIPTION (protected route)
-------------------------------------- */
router.post("/", auth, async (req, res) => {
  try {
    console.log("[subscriptions] body:", req.body);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }

    const { planName, price, firstName, lastName, address, city, state, zip, paymentMethod } = req.body;

    if (!planName || typeof planName !== "string") {
      return res.status(400).json({ message: "Invalid or missing planName" });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const subscription = new Subscription({
      user: req.user.id,
      planName: planName.trim(),
      price: numericPrice,
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      paymentMethod
    });

    const saved = await subscription.save();
    console.log("[subscriptions] saved id =", saved._id);

    return res.json({ message: "Subscription created", id: saved._id });

  } catch (err) {
    console.error("POST /api/subscriptions error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* --------------------------------------
   DEBUG: LAST 20 SUBSCRIPTIONS
-------------------------------------- */
router.get("/debug/latest", async (req, res) => {
  try {
    const docs = await Subscription.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.json({ ok: true, count: docs.length, docs });
  } catch (err) {
    console.error("debug/latest error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

module.exports = router;
