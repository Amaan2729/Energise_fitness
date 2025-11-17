const express = require('express');
const router = express.Router();
const { client } = require('../utils/redis');

// GET /api/redis/status - quick health + small stats for demo
router.get('/status', async (req, res) => {
  try {
    const isReady = !!client.isReady;
    // Try a simple ping to verify responsiveness
    let pong = null;
    try { pong = await client.ping(); } catch (e) { pong = null; }

    // dbSize may be supported; wrap it in try/catch
    let dbSize = null;
    try { dbSize = await client.dbSize(); } catch (e) { dbSize = null; }

    res.json({ connected: isReady, pong, dbSize });
  } catch (err) {
    console.error('Error in /api/redis/status', err);
    res.status(500).json({ connected: false, error: err.message });
  }
});

module.exports = router;
