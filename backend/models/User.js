const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // add other fields if needed
}, { timestamps: true });

// Prevent OverwriteModelError in dev/hot-reload
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
