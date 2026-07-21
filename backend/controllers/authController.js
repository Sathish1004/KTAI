const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper to sign tokens
const signToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'super_secret_key_knowledgefeed_ai',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Log in user (Admin/Employee)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password.'
      });
    }

    // 2. Find user in the database
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    // 3. Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    // 4. Generate JWT
    const token = signToken(user.id, user.role);

    // 5. Send response (exclude password)
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        }
      }
    });

  } catch (error) {
    console.error("Login controller error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error.'
    });
  }
};

// Get current logged-in user details
exports.getMe = async (req, res) => {
  try {
    // req.user is already populated by authMiddleware.protect
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error("getMe controller error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error.'
    });
  }
};

// Register a new Employee (Admin access only)
exports.registerEmployee = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, and password.'
      });
    }

    // 2. Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'A user with this email address already exists.'
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert new employee
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'employee']
    );

    // 5. Send response
    res.status(201).json({
      status: 'success',
      message: 'Employee account registered successfully.',
      data: {
        user: {
          id: result.insertId,
          name,
          email,
          role: 'employee'
        }
      }
    });

  } catch (error) {
    console.error("Register employee controller error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during employee registration.'
    });
  }
};

