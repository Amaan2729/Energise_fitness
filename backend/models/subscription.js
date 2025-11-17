// models/Subscription.js
const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  planName: { type: String, required: true },
  price: { type: Number, required: true },
  firstName: String,
  lastName: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  paymentMethod: String
}, { timestamps: true });

module.exports = mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
