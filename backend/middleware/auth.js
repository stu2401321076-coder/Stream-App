const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'university_netflix_clone_secret_2024';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      type: 'https://httpstatuses.com/401',
      title: 'Unauthorized',
      status: 401,
      detail: 'Authentication token is missing or malformed',
      instance: req.originalUrl,
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      type: 'https://httpstatuses.com/401',
      title: 'Unauthorized',
      status: 401,
      detail: 'Authentication token is invalid or expired',
      instance: req.originalUrl,
    });
  }
}

function streamAuthMiddleware(req, res, next) {
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({
      type: 'https://httpstatuses.com/401',
      title: 'Unauthorized',
      status: 401,
      detail: 'Stream token is required as a query parameter',
      instance: req.originalUrl,
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      type: 'https://httpstatuses.com/401',
      title: 'Unauthorized',
      status: 401,
      detail: 'Stream token is invalid or expired',
      instance: req.originalUrl,
    });
  }
}

function generateShortLivedStreamToken(movieId) {
  return jwt.sign({ movieId }, JWT_SECRET, { expiresIn: '1h' });
}

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      type: 'https://httpstatuses.com/403',
      title: 'Forbidden',
      status: 403,
      detail: 'Admin access required',
      instance: req.originalUrl,
    });
  }
  next();
}

module.exports = { generateToken, verifyToken, authMiddleware, adminMiddleware, streamAuthMiddleware, generateShortLivedStreamToken };
