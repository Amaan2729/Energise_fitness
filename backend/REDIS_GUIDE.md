# 🚀 Redis Integration Guide

## What is Redis?

Redis is an **in-memory data store** that acts as a cache. It's much faster than databases and perfect for:

- **Caching** frequently accessed data
- **Sessions** management
- **Real-time** operations
- **Notifications** and messaging

---

## 📋 Installation & Setup

### 1. **Install Redis** (if not already installed)

**macOS:**

```bash
brew install redis
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get install redis-server
```

**Windows:**
Download from: https://github.com/microsoftarchive/redis/releases

---

## 🚀 Getting Started

### 2. **Start Redis Server**

```bash
redis-server
```

You should see:

```
* Server started, Redis version 7.x.x
* Ready to accept connections
```

### 3. **Verify Redis is Running**

In a new terminal:

```bash
redis-cli ping
# Output: PONG ✓
```

---

## ✅ Verify Redis in Your Project

### Option 1: Quick Verification Script

```bash
cd backend
npm run verify:redis
```

This will show:

- ✓ Redis connection status
- ✓ Server information
- ✓ Memory usage
- ✓ Cached keys
- ✓ TTL information

### Option 2: Command Line Monitor

```bash
# In a new terminal
redis-cli

# Inside redis-cli:
PING                    # Check connection
KEYS *                  # See all cached keys
GET user:1:profile      # Get specific cache
TTL user:1:profile      # Check expiration
DEL user:1:profile      # Delete cache
FLUSHDB                 # Clear all cache
INFO                    # Server stats
```

---

## 🏗️ How to Use in Your Project

### 1. **Cache User Profile**

```javascript
const { cacheGet, cacheSet } = require("./utils/redis");

// Save user to cache
await cacheSet("user:123:profile", userData, 3600);
// Cache for 1 hour (3600 seconds)

// Retrieve from cache
const user = await cacheGet("user:123:profile");
```

### 2. **Cache Subscriptions**

```javascript
// On subscription creation
const subscriptions = await fetchSubscriptions(userId);
await cacheSet(`user:${userId}:subscriptions`, subscriptions, 1800);
// Cache for 30 minutes

// On subscription update - invalidate cache
await cacheDelete(`user:${userId}:subscriptions`);
```

### 3. **Use in Your Routes**

See `routes/redisExampleRoutes.js` for complete examples:

```bash
# Test endpoints
curl http://localhost:5000/users/1           # First call: Database
curl http://localhost:5000/users/1           # Second call: Cache (faster!)
```

---

## 📊 Visual Representation of Redis in Your Project

```
┌─────────────────────────────────────────────────────────────┐
│                    User Request                              │
│         (Login, Subscribe, View Profile, etc.)               │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────▼───────────┐
        │  Check Redis Cache      │
        │  (In-Memory Fast)       │
        └───┬──────────────────┬──┘
            │                  │
       CACHE HIT          CACHE MISS
       (Return Data)      (Query DB)
            │                  │
            │         ┌────────▼─────────┐
            │         │  MongoDB Database │
            │         │  (Slower)         │
            │         └────────┬─────────┘
            │                  │
            │         ┌────────▼──────────┐
            │         │  Store in Redis   │
            │         │  (TTL: 1-3600 sec)│
            │         └────────┬──────────┘
            │                  │
            └────────┬─────────┘
                     │
        ┌────────────▼──────────────┐
        │  Return Data to User       │
        │  (Fast Response!)          │
        └────────────────────────────┘

Benefits:
✓ Faster response times (milliseconds vs seconds)
✓ Reduced database load
✓ Better user experience
✓ Handles high traffic better
```

---

## 🎯 Real-World Use Cases in Your Project

### Scenario 1: User Login

```javascript
// First login: Database query
GET /login → MongoDB → Redis cache set → Response (2-3s)

// Subsequent requests: Cache hit
GET /profile → Redis cache → Response (50-100ms) ✨
```

### Scenario 2: Subscription Plans

```javascript
// Cache subscription plans (rarely change)
await cacheSet("plans:all", plansData, 86400); // 1 day

// User views plans → Cache hit → Instant response!
```

### Scenario 3: Session Management

```javascript
// Store user session
await cacheSet(`session:${sessionId}`, userData, 1800);
// Auto-expire after 30 minutes

// User stays logged in while cache is valid
```

---

## 🔍 Monitoring Redis

### Real-Time Monitoring

```bash
# Watch Redis commands in real-time
redis-cli MONITOR

# See memory usage
redis-cli INFO memory

# Performance stats
redis-cli INFO stats
```

### Check Cache Effectiveness

```bash
redis-cli INFO stats
# Look for: keyspace_hits vs keyspace_misses
# Higher hits = better performance! 📈
```

---

## ⚙️ Configuration

### Add to `.env` file:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # Leave empty if no password
```

### TTL (Time To Live) Examples:

```javascript
60; // 1 minute
300; // 5 minutes
1800; // 30 minutes
3600; // 1 hour
86400; // 1 day
604800; // 1 week
```

---

## 🐛 Troubleshooting

### Redis Not Running?

```bash
# Check if Redis is running
redis-cli ping
# If error: "Could not connect to Redis"

# Start Redis:
redis-server

# Or on macOS with Homebrew:
brew services start redis
```

### Port Already in Use?

```bash
# Redis uses port 6379 by default
# Change in .env:
REDIS_PORT=6380

# Or kill the process:
lsof -i :6379
kill -9 <PID>
```

### Memory Issues?

```bash
# Clear all cache
redis-cli FLUSHDB

# Set max memory policy
redis-cli CONFIG SET maxmemory 268435456
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

---

## 📈 Performance Comparison

| Operation          | Without Cache | With Redis Cache    |
| ------------------ | ------------- | ------------------- |
| Get User Profile   | 500-1000ms    | 50-100ms            |
| List Subscriptions | 800-2000ms    | 100-200ms           |
| Search Products    | 1000-3000ms   | 200-500ms           |
| Response Speed     | **Slow**      | **⚡ 5-10x Faster** |

---

## ✨ Next Steps

1. ✅ Install Redis
2. ✅ Run `npm run verify:redis` to test connection
3. ✅ Integrate caching in your routes
4. ✅ Monitor performance improvement
5. ✅ Set appropriate TTLs for your data

---

## 📚 Useful Commands

```bash
# Terminal Commands
npm run verify:redis          # Verify connection
redis-server                  # Start Redis
redis-cli                     # Connect to Redis
redis-cli MONITOR            # Watch commands
redis-cli INFO               # Server stats

# Redis CLI Commands
PING                         # Test connection
SET key value                # Set value
GET key                       # Get value
DEL key                       # Delete key
KEYS *                        # List all keys
FLUSHDB                       # Clear database
TTL key                       # Check expiration
SETEX key 60 value           # Set with TTL
```

---

## 🎉 Summary

You now have:

- ✅ Redis installed and configured
- ✅ Verification script to test connection
- ✅ Example routes showing Redis usage
- ✅ Caching utilities in `utils/redis.js`
- ✅ Complete integration guide

**Your project is now super-fast with Redis caching!** 🚀
