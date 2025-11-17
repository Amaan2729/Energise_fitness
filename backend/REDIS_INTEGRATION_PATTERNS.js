/**
 * Integration Example: How to add caching to existing routes
 * Copy and adapt this pattern to your actual routes
 */

// =========================================
// BEFORE: Without Redis (Slow)
// =========================================
/*
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);  // Database query every time
    res.json(user);  // 500-1000ms response time
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
*/

// =========================================
// AFTER: With Redis (Fast!)
// =========================================

const express = require('express');
const { cacheGet, cacheSet, cacheDelete } = require('../utils/redis');
const User = require('../models/User');

const router = express.Router();

// Pattern 1: Cache Read Operations (GET)
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const cacheKey = `user:${userId}:data`;

    // 1. Try to get from cache first (FAST - 50ms)
    let user = await cacheGet(cacheKey);
    
    if (user) {
      console.log(`✓ Cache HIT for user ${userId}`);
      return res.json({ 
        source: 'cache',
        data: user,
        responseTime: 'Fast ⚡'
      });
    }

    // 2. Cache MISS - fetch from database (SLOW - 500ms)
    console.log(`✗ Cache MISS for user ${userId} - querying database`);
    user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 3. Store in cache for 1 hour
    await cacheSet(cacheKey, user, 3600);
    console.log(`✓ User cached for 1 hour`);

    res.json({ 
      source: 'database',
      data: user,
      responseTime: 'Slow (first time)'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pattern 2: Invalidate Cache on Write Operations (POST/PUT/DELETE)
router.post('/user', async (req, res) => {
  try {
    // 1. Create new user in database
    const newUser = new User(req.body);
    await newUser.save();
    
    console.log(`✓ User created: ${newUser._id}`);
    
    // 2. Cache the new user
    const cacheKey = `user:${newUser._id}:data`;
    await cacheSet(cacheKey, newUser, 3600);
    
    res.status(201).json({ 
      message: 'User created',
      data: newUser 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pattern 3: Update with Cache Invalidation
router.put('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const cacheKey = `user:${userId}:data`;

    // 1. Update in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      req.body,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. IMPORTANT: Invalidate old cache
    await cacheDelete(cacheKey);
    console.log(`✓ Cache invalidated for user ${userId}`);

    // 3. Cache new data
    await cacheSet(cacheKey, updatedUser, 3600);
    console.log(`✓ Updated user cached`);

    res.json({ 
      message: 'User updated',
      data: updatedUser,
      cacheStatus: 'refreshed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pattern 4: Delete with Cache Cleanup
router.delete('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const cacheKey = `user:${userId}:data`;

    // 1. Delete from database
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Delete from cache
    await cacheDelete(cacheKey);
    console.log(`✓ User and cache deleted: ${userId}`);

    res.json({ 
      message: 'User deleted',
      data: deletedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pattern 5: List with Pagination Cache
router.get('/users', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const cacheKey = `users:page:${page}:limit:${limit}`;

    // Try cache first
    let users = await cacheGet(cacheKey);
    if (users) {
      console.log(`✓ Cached user list returned`);
      return res.json({ 
        source: 'cache',
        data: users,
        page,
        limit
      });
    }

    // Fetch from database
    console.log(`✗ Fetching user list from database`);
    users = await User.find()
      .skip((page - 1) * limit)
      .limit(limit);

    // Cache with shorter TTL (5 minutes for lists)
    await cacheSet(cacheKey, users, 300);

    res.json({ 
      source: 'database',
      data: users,
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

/*
═══════════════════════════════════════════════════════════════════
CACHING STRATEGY SUMMARY

GET Routes (Read):
  ✓ Always check cache first
  ✓ If miss, fetch from DB and cache it
  ✓ TTL: 5-60 minutes depending on data freshness

POST Routes (Create):
  ✓ Create in DB
  ✓ Cache the new item
  ✓ Consider clearing list caches

PUT Routes (Update):
  ✓ Update in DB
  ✓ DELETE old cache (invalidate)
  ✓ Cache new data
  ✗ Never serve stale data!

DELETE Routes:
  ✓ Delete from DB
  ✓ Delete from cache
  ✓ Clear related list caches

TTL Guidelines:
  - User data: 1 hour (3600s)
  - Lists: 5-10 minutes (300-600s)
  - Settings: 1 day (86400s)
  - Session: 30 minutes (1800s)
═══════════════════════════════════════════════════════════════════
*/
