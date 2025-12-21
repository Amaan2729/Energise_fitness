const redis = require("redis");

let client = null;

if (process.env.REDIS_URL) {
  client = redis.createClient({
    url: process.env.REDIS_URL
  });

  client.on("connect", () => {
    console.log("✅ Redis Connected");
  });

  client.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
  });

  (async () => {
    try {
      await client.connect();
    } catch (err) {
      console.error("❌ Redis Connection Failed:", err.message);
    }
  })();
} else {
  console.warn("⚠️ REDIS_URL not found. Redis disabled.");
}

module.exports = { client };
