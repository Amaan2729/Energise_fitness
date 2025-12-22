/* ---------------------------------------------
   EnerGise Backend - FINAL PRODUCTION VERSION
---------------------------------------------- */

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

// CORS (safe for frontend hosted anywhere)
app.use(cors({
  origin: "*"
}));

// ----------------------------
// MONGODB (Render-safe)
// ----------------------------
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not set in environment variables!");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// ----------------------------
// REDIS (Render-safe)
// ----------------------------
let redisClient = null;

if (process.env.REDIS_URL) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });

  redisClient.on("connect", () => {
    console.log("✅ Redis Connected");
  });

  redisClient.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
  });

  (async () => {
    try {
      await redisClient.connect();
    } catch (err) {
      console.error("❌ Redis Connection Failed:", err.message);
      redisClient = null; // disable redis safely
    }
  })();
} else {
  console.warn("⚠️ REDIS_URL not set. Redis disabled.");
}

// ----------------------------
// HTTP & SOCKET.IO
// ----------------------------
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

app.set("io", io);
app.set("redis", redisClient);

io.on("connection", (socket) => {
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
// SERVE FRONTEND (STATIC)
// ----------------------------
const FRONTEND_PATH = path.join(__dirname, "../frontend");

app.use(express.static(FRONTEND_PATH));

// Catch-all → index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// ----------------------------
// GLOBAL ERROR HANDLER
// ----------------------------
app.use((err, req, res, next) => {
  console.error("❌ Express Error:", err.message);
  res.status(500).json({ message: "Server error" });
});

// ----------------------------
// START SERVER
// ----------------------------
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
