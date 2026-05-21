const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  name: {
    type: String
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  isSubscribed: {
    type: Boolean,
    default: false
  },

  subscriptionPlan: {
    type: String,
    default: null
  }

}, {

  timestamps: true

});

// Prevent OverwriteModelError
module.exports =
  mongoose.models.User ||
  mongoose.model(
    "User",
    UserSchema
  );




