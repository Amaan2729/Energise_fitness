const redis = require('redis');

const REDIS_URL = process.env.REDIS_URL || null;

let client;
if (REDIS_URL) {
  client = redis.createClient({ url: REDIS_URL });
  client.connect().catch(console.error);
} else {
  console.warn('⚠️ Redis URL not found. Caching disabled.');
  // Create dummy functions to avoid breaking your routes
  client = {
    get: async () => null,
    setEx: async () => {},
    del: async () => {}
  };
}

module.exports = {
  cacheGet: async (key) => {
    if (!REDIS_URL) return null;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  },
  cacheSet: async (key, value, ttl) => {
    if (!REDIS_URL) return;
    await client.setEx(key, ttl, JSON.stringify(value));
  },
  cacheDelete: async (key) => {
    if (!REDIS_URL) return;
    await client.del(key);
  }
};
