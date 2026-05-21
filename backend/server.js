require("dotenv").config();

console.log("MONGO_URI =>", process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const http = require("http");
const { Server } = require("socket.io");

const redis = require("redis");

const path = require("path");

/* =========================
   APP INIT
========================= */

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());

app.use(cors({
  origin: "*",
  credentials: true
}));

/* =========================
   MONGODB CONNECTION
========================= */

if (!process.env.MONGO_URI) {

  console.error("❌ MONGO_URI not set");

  process.exit(1);

}

mongoose
.connect(process.env.MONGO_URI)

.then(() => {

  console.log("✅ MongoDB Connected");

})

.catch((err) => {

  console.error(
    "❌ MongoDB Error:",
    err.message
  );

});

/* =========================
   REDIS CONNECTION
========================= */

let redisClient = null;

if (process.env.REDIS_URL) {

  redisClient = redis.createClient({

    url: process.env.REDIS_URL

  });

  redisClient.on("connect", () => {

    console.log("✅ Redis Connected");

  });

  redisClient.on("error", (err) => {

    console.error(
      "❌ Redis Error:",
      err.message
    );

  });

  (async () => {

    try {

      await redisClient.connect();

    }

    catch (e) {

      console.error(
        "❌ Redis Connect Failed:",
        e.message
      );

    }

  })();

}

/* =========================
   HTTP SERVER
========================= */

const server = http.createServer(app);

/* =========================
   SOCKET.IO
========================= */

const io = new Server(server, {

  cors: {

    origin: "*",

    credentials: true

  }

});

/* =========================
   MAKE GLOBAL
========================= */

app.set("io", io);

app.set("redis", redisClient);

/* =========================
   SOCKET CONNECTION
========================= */

io.on("connection", (socket) => {

  console.log(
    "✅ Admin Connected:",
    socket.id
  );

  /* =========================
     SEND CONNECTION MESSAGE
  ========================= */

  socket.emit("notification", {

    type: "system",

    title: "🟢 Admin Dashboard Connected",

    message:
    "Real-time notifications are active."

  });

  /* =========================
     DISCONNECT
  ========================= */

  socket.on("disconnect", () => {

    console.log(
      "❌ Client Disconnected:",
      socket.id
    );

  });

});

/* =========================
   API ROUTES
========================= */

app.use(
  "/api/users",
  require("./routes/userRoutes")
);

app.use(
  "/api/orders",
  require("./routes/OrderRoutes")
);

app.use(
  "/api/subscriptions",
  require("./routes/subscriptionRoutes")
);

app.use(
  "/api/contacts",
  require("./routes/contactRoutes")
);

app.use(
  "/api/redis",
  require("./routes/redisStatus")
);

/* =========================
   TEST SOCKET ROUTE
========================= */

app.get("/test-notification", (req, res) => {

  io.emit("notification", {

    type: "system",

    title: "🚀 Test Notification",

    message:
    "Socket.IO is working perfectly!"

  });

  res.json({

    success: true,

    message:
    "Notification Sent"

  });

});

/* =========================
   SERVE FRONTEND
========================= */

app.use(
  express.static(
    path.join(__dirname, "../frontend")
  )
);

/* =========================
   EXPRESS 5 SAFE FALLBACK
========================= */

app.use((req, res) => {

  res.sendFile(

    path.join(
      __dirname,
      "../frontend/index.html"
    )

  );

});

/* =========================
   START SERVER
========================= */

const PORT =
process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(
    `🚀 Server Running On Port ${PORT}`
  );

});