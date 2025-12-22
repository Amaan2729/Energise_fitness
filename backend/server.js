const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const redis = require("redis");
const path = require("path");

// ----------------------------
// APP INIT
// ----------------------------
const app = express();
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

// ----------------------------
// MONGODB
// ----------------------------
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not set");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// ----------------------------
// REDIS
// ----------------------------
let redisClient = null;

if (process.env.REDIS_URL) {
  redisClient = redis.createClient({ url: process.env.REDIS_URL });

  redisClient.on("connect", () => console.log("✅ Redis Connected"));
  redisClient.on("error", err => console.error("❌ Redis Error:", err.message));

  (async () => {
    try {
      await redisClient.connect();
    } catch (e) {
      console.error("❌ Redis connect failed:", e.message);
    }
  })();
}

// ----------------------------
// HTTP + SOCKET.IO
// ----------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", credentials: true }
});

app.set("io", io);
app.set("redis", redisClient);

io.on("connection", socket => {
  console.log("🔌 Client connected:", socket.id);
  socket.on("disconnect", () =>
    console.log("🔌 Client disconnected:", socket.id)
  );
});

// ----------------------------
// API ROUTES
// ----------------------------
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/OrderRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/redis", require("./routes/redisStatus"));

// ----------------------------
// SERVE FRONTEND (IMPORTANT)
// ----------------------------
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ EXPRESS 5 SAFE FALLBACK
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ----------------------------
// START SERVER
// ----------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
