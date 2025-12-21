const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const redis = req.app.get("redis");

  if (!redis) {
    return res.status(503).json({
      status: "disabled",
      message: "Redis not configured"
    });
  }

  try {
    await redis.ping();
    res.json({ status: "connected" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      error: err.message
    });
  }
});

module.exports = router;
