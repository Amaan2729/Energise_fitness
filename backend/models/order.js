const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  firstName: String,
  lastName: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  paymentMethod: String,
  products: [{ name: String, price: Number, quantity: Number }],
  totalPrice: Number,
  status: { type: String, default: 'pending' },

  // NEW: non-sensitive card info only
  cardLast4: { type: String },      // last 4 digits only
  cardExpiry: { type: String },     // MM/YY or similar
  cardBrand: { type: String },      // optional
},
{
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
