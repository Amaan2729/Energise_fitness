const express = require("express");

const router = express.Router();

const Order = require("../models/order");

const auth = require("../middleware/auth");

/* =========================
   CREATE ORDER
========================= */

router.post("/", auth, async (req, res) => {

  try {

    const {

      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      paymentMethod,
      products

    } = req.body;

    /* VALIDATION */

    if (

      !products ||
      products.length === 0

    ) {

      return res.status(400).json({

        message: "Products required"

      });

    }

    /* =========================
       CALCULATE TOTAL
    ========================= */

    const totalPrice = products.reduce(

      (sum, p) =>

        sum + p.price * p.quantity,

      0

    );

    /* =========================
       CREATE ORDER
    ========================= */

    const order = new Order({

      user: req.user?.id || null,

      firstName,
      lastName,

      address,
      city,
      state,
      zip,

      paymentMethod,

      products,

      totalPrice,

      status: "pending"

    });

    await order.save();

    console.log(
      "✅ Order Saved:",
      order._id
    );

    /* =========================
       REAL-TIME NOTIFICATION
    ========================= */

    const io = req.app.get("io");

    if (io) {

      io.emit("notification", {

        type: "order",

        title: "🛒 New Order",

        message:
        `${firstName} ${lastName} placed a new order`,

        data: {

          orderId: order._id,

          customer:
          `${firstName} ${lastName}`,

          totalPrice,

          paymentMethod,

          city,

          state,

          products

        }

      });

      console.log(
        "📢 Order notification sent"
      );

    }

    /* =========================
       RESPONSE
    ========================= */

    res.status(201).json({

      message:
      "Order created successfully",

      orderId: order._id

    });

  }

  catch (err) {

    console.error(
      "❌ Order Error:",
      err
    );

    res.status(500).json({

      message: "Server error"

    });

  }

});

module.exports = router;