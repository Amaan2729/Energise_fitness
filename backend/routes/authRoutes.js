const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = await user.generateToken();
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err && (err.stack || err.message || err));
    // forward to global error handler
    next(err);
  }
});

module.exports = router;