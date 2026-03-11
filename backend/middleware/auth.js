const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nupatai_fallback_secret';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Authentication required.' });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ detail: 'Invalid or expired session. Please sign in again.' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
