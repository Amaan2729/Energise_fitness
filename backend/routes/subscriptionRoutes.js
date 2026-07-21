const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const Subscription = require("../models/subscription");

const {

  cacheGet,
  cacheSet

} = require("../utils/redisHelpers");

/* =========================
   GET SUBSCRIPTION PLANS
========================= */

router.get("/plans", async (req, res) => {

  try {

    const cacheKey = "plans:all";

    const cached =
    await cacheGet(cacheKey)

    .catch(() => null);

    if (cached) {

      return res.json({

        plans: cached

      });

    }

    const plans = [

      {

        name: "Basic",

        price: 6500,

        description:
        "Standard workouts"

      },

      {

        name: "Premium",

        price: 7500,

        description:
        "Personal training"

      },

      {

        name: "Ultimate",

        price: 8500,

        description:
        "All access"

      }

    ];

    await cacheSet(

      cacheKey,
      plans,
      86400

    ).catch(() => {});

    res.json({

      plans

    });

  }

  catch {

    res.status(500).json({

      message: "Server error"

    });

  }

});

/* =========================
   CREATE SUBSCRIPTION
========================= */

router.post("/", auth, async (req, res) => {

  try {

    const userId =

      req.user?.id ||

      req.user?._id ||

      req.user?.userId;

    if (!userId) {

      return res.status(401).json({

        message: "Unauthorized"

      });

    }

    const {

      planName,
      price,

      firstName,
      lastName,

      address,
      city,
      state,
      zip,

      paymentMethod

    } = req.body;

    /* VALIDATION */

    if (

      !planName ||
      !price

    ) {

      return res.status(400).json({

        message: "Missing data"

      });

    }

    /* CREATE SUBSCRIPTION */

    const subscription =
    new Subscription({

      user: userId,

      planName,
      price,

      firstName,
      lastName,

      address,
      city,
      state,
      zip,

      paymentMethod

    });

    await subscription.save();

    console.log(
      "✅ Subscription Saved:",
      subscription._id
    );

    /* =========================
       REAL-TIME NOTIFICATION
    ========================= */

    const io = req.app.get("io");

    if (io) {

      io.emit("notification", {

        type: "subscription",

        title:
        "💳 New Membership Subscription",

        message:
        `${firstName} ${lastName} subscribed to ${planName}`,

        data: {

          subscriptionId:
          subscription._id,

          customer:
          `${firstName} ${lastName}`,

          planName,

          price,

          paymentMethod,

          city,

          state

        }

      });

      console.log(
        "📢 Subscription notification sent"
      );

    }

    /* RESPONSE */

    res.status(201).json({

      message:
      "Subscription created"

    });

  }

  catch (err) {

    console.error(
      "❌ Subscription Error:",
      err
    );

    res.status(500).json({

      message: "Server error"

    });

  }

});

/* =========================
   DEBUG ROUTE
========================= */

router.get("/debug/latest", async (req, res) => {

  const docs = await Subscription.find()

  .sort({ createdAt: -1 })

  .limit(10);

  res.json(docs);

});

module.exports = router;