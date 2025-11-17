// Redis integration example for user caching
const express = require('express');
const { cacheGet, cacheSet, cacheDelete } = require('../utils/redis');
const router = express.Router();

// Example: Cache user profile
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const cacheKey = `user:${userId}:profile`;

    // Try to get from cache first
    let user = await cacheGet(cacheKey);
    
    if (user) {
      console.log('✓ User retrieved from Redis cache');
      return res.json({ source: 'cache', data: user });
    }

    // If not in cache, simulate database fetch
    console.log('✗ Cache miss - fetching from database');
    const userData = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      created_at: new Date()
    };

    // Cache the result for 1 hour (3600 seconds)
    await cacheSet(cacheKey, userData, 3600);
    console.log('✓ User cached in Redis');

    res.json({ source: 'database', data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example: Cache subscriptions
router.get('/subscriptions/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const cacheKey = `user:${userId}:subscriptions`;

    // Check cache
    let subscriptions = await cacheGet(cacheKey);
    
    if (subscriptions) {
      console.log('✓ Subscriptions retrieved from cache');
      return res.json({ cached: true, data: subscriptions });
    }

    // Simulate DB fetch
    const subscriptionData = [
      { id: 1, plan: 'Basic', price: 6500, status: 'active' },
      { id: 2, plan: 'Premium', price: 7500, status: 'active' }
    ];

    // Cache for 30 minutes
    await cacheSet(cacheKey, subscriptionData, 1800);
    console.log('✓ Subscriptions cached');

    res.json({ cached: false, data: subscriptionData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example: Invalidate cache after updating
router.put('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const cacheKey = `user:${userId}:profile`;

    // Update in database (simulated)
    const updatedUser = { id: userId, ...req.body };

    // Invalidate old cache
    await cacheDelete(cacheKey);
    console.log('✓ Cache invalidated for user:', userId);

    // Cache new data
    await cacheSet(cacheKey, updatedUser, 3600);
    console.log('✓ Updated user cached');

    res.json({ message: 'User updated', data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
