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
          fullName: user.fullName || user.name,
          name: user.fullName || user.name, // compatibility
          email: user.email,
          role: user.role,
          status: user.status || 'Active',
          createdAt: user.createdAt || user.created_at,
          updatedAt: user.updatedAt
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long.'
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

    // 4. Insert new employee (NEVER store plain-text password for new employees)
    const [result] = await pool.query(
      'INSERT INTO users (fullName, email, password, password_plain, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, null, 'employee', 'Active']
    );

    // 5. Send response
    res.status(201).json({
      status: 'success',
      message: 'Employee account registered successfully.',
      data: {
        user: {
          id: result.insertId,
          fullName: name,
          name: name,
          email,
          role: 'employee',
          status: 'Active'
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

// Get all employees (Admin access only)
exports.getAllEmployees = async (req, res) => {
  try {
    const [employees] = await pool.query(
      'SELECT id, fullName, fullName AS name, email, role, status, createdAt, updatedAt FROM users WHERE role = "employee" ORDER BY fullName ASC'
    );
    res.status(200).json({
      status: 'success',
      data: { employees }
    });
  } catch (error) {
    console.error("getAllEmployees error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch employees list.'
    });
  }
};

// Update an employee (Admin access only)
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fullName, email, password, status } = req.body;
    const resolvedName = fullName || name;

    if (!resolvedName || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and email are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address.'
      });
    }

    // Check if email already in use by another user
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'A user with this email address already exists.'
      });
    }

    const updatedStatus = status || 'Active';

    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters long.'
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET fullName = ?, email = ?, password = ?, password_plain = NULL, status = ? WHERE id = ? AND role = "employee"',
        [resolvedName, email, hashedPassword, updatedStatus, id]
      );
    } else {
      await pool.query(
        'UPDATE users SET fullName = ?, email = ?, status = ? WHERE id = ? AND role = "employee"',
        [resolvedName, email, updatedStatus, id]
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Employee updated successfully.'
    });
  } catch (error) {
    console.error("updateEmployee error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update employee.'
    });
  }
};

// Delete an employee (Admin access only)
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM users WHERE id = ? AND role = "employee"', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Employee deleted successfully.'
    });
  } catch (error) {
    console.error("deleteEmployee error:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete employee.'
    });
  }
};

