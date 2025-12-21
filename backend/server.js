/* ---------------------------------------------
   EnerGise Backend - FINAL STABLE VERSION
---------------------------------------------- */

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const redis = require("redis");

// ----------------------------
// APP INIT
// ----------------------------
const app = express();
app.use(express.json());

app.use(cors({
  origin: "*",
  credentials: true
}));

// ----------------------------
// MONGODB
// ----------------------------
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// ----------------------------
// REDIS (RENDER SAFE)
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
    origin: "*",
    credentials: true
  }
});

app.set("io", io);
app.set("redis", redisClient);

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// ----------------------------
// ROUTES
// ----------------------------
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/OrderRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/redis", require("./routes/redisStatus"));

// ----------------------------
// ROOT
// ----------------------------
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ----------------------------
// ERROR HANDLER
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
