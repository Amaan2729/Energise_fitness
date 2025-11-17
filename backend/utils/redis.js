const redis = require('redis');

// Create a Redis client
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined
});

// Handle connection events
client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));
client.on('ready', () => console.log('Redis Client Ready'));

// Connect to Redis
client.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
  process.exit(1);
});

// Utility functions for caching
const cacheGet = async (key) => {
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('Error getting from cache:', err);
    return null;
  }
};

const cacheSet = async (key, value, ttl = 3600) => {
  try {
    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('Error setting cache:', err);
    return false;
  }
};

const cacheDelete = async (key) => {
  try {
    await client.del(key);
    return true;
  } catch (err) {
    console.error('Error deleting from cache:', err);
    return false;
  }
};

const cacheClear = async () => {
  try {
    await client.flushDb();
    return true;
  } catch (err) {
    console.error('Error clearing cache:', err);
    return false;
  }
};

module.exports = {
  client,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheClear
};
