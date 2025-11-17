const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || null;

let client;
let isConnected = false;

function initClient() {
  if (client) return client;
  client = createClient({
    url: REDIS_URL,
    password: REDIS_PASSWORD || undefined,
    socket: { reconnectStrategy: retries => Math.min(retries * 50, 500) }
  });

  client.on('error', (err) => {
    console.warn('[redis] client error', err && err.message);
    isConnected = false;
  });
  client.on('ready', () => { isConnected = true; console.log('[redis] ready'); });
  client.on('end', () => { isConnected = false; console.log('[redis] connection closed'); });

  (async () => {
    try { await client.connect(); } catch (err) { console.warn('[redis] connect failed, continuing without cache', err && err.message); isConnected = false; }
  })();

  return client;
}

function safeParse(val) {
  if (val == null) return null;
  try { return JSON.parse(val); } catch { return val; }
}

async function cacheGet(key) {
  try {
    initClient();
    if (!client || !isConnected) return null;
    const v = await client.get(key);
    return safeParse(v);
  } catch (err) {
    console.warn('[redis] cacheGet error', err && err.message);
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 86400) {
  try {
    initClient();
    if (!client || !isConnected) return false;
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds && Number(ttlSeconds) > 0) {
      await client.setEx(key, Number(ttlSeconds), payload);
    } else {
      await client.set(key, payload);
    }
    return true;
  } catch (err) {
    console.warn('[redis] cacheSet error', err && err.message);
    return false;
  }
}

async function cacheDelete(key) {
  try {
    initClient();
    if (!client || !isConnected) return false;
    await client.del(key);
    return true;
  } catch (err) {
    console.warn('[redis] cacheDelete error', err && err.message);
    return false;
  }
}

module.exports = { initClient, cacheGet, cacheSet, cacheDelete, _client: () => client };