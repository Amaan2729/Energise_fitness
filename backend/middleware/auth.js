const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.cookies?.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized. Please login.' });

    const parts = authHeader.split(' ');
    const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : authHeader;
    if (!token) return res.status(401).json({ message: 'Unauthorized. Please login.' });

    const secret = process.env.JWT_SECRET || 'secret';
    const payload = jwt.verify(token, secret);

    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    console.error('auth middleware error:', err && err.message);
    return res.status(401).json({ message: 'Unauthorized. Please login.' });
  }
};
