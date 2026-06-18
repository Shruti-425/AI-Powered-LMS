const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lms-dev-secret-change-in-production';

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied for this role' });
  }

  next();
};

module.exports = { authenticate, authorize, JWT_SECRET };
