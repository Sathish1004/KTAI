const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Get token from authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_key_knowledgefeed_ai'
      );
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token. Please log in again.'
      });
    }

    // 3. Check if user still exists in database
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4. Grant access and store user details in req.user
    req.user = users[0];
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication.'
    });
  }
};

// Restrict access to specific roles (e.g. admin)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};
