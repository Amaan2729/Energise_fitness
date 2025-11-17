/* ---------------------------------------------
   EnerGise Backend - CLEAN & FIXED VERSION
---------------------------------------------- */

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

// Redis client
const { client: redisClient } = require("./utils/redis");

// Initialize Express
const app = express();
app.use(express.json());

// ----------------------------
// CORS FIX (Do NOT duplicate)
// ----------------------------
app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ----------------------------
// MONGO DB CONNECTION (FIXED)
// ----------------------------
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/database";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`✅ MongoDB Connected`);
    console.log(`[mongo] Using Database: database`);
  })
  .catch(err => console.error("❌ MongoDB Error:", err));

// ----------------------------
// HTTP & SOCKET.IO SERVER
// ----------------------------
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:5500",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Make global
app.set("io", io);
app.set("redis", redisClient);

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);
  socket.on("disconnect", () => console.log("🔌 Client disconnected:", socket.id));
});

// ----------------------------
// IMPORT ROUTES
// ----------------------------
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/OrderRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const contactRoutes = require("./routes/contactRoutes");
const redisStatusRoutes = require("./routes/redisStatus");

// ----------------------------
// MOUNT ROUTES
// ----------------------------
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/redis", redisStatusRoutes);

// ----------------------------
// DEFAULT ROOT
// ----------------------------
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ----------------------------
// GLOBAL ERROR HANDLER
// ----------------------------
app.use((err, req, res, next) => {
  console.error("❌ Express Error:", err);
  res.status(err.status || 500).json({
    message: "Server error",
    error: process.env.NODE_ENV === "production" ? undefined : err.message
  });
});

// ----------------------------
// START SERVER
// ----------------------------
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
