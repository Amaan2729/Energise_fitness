const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    zip: String,

    paymentMethod: String,

    products: [
      {
        name: String,
        price: Number,
        quantity: Number
      }
    ],

    status: {
      type: String,
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
