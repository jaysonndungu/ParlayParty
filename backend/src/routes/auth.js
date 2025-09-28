const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = getDatabase();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  fullName: Joi.string().min(2).max(100).required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }

    const { email, username, fullName, password } = value;

    // Check if user already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists with this email or username' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (email, username, full_name, password_hash, wallet_balance) 
         VALUES (?, ?, ?, ?, ?)`,
        [email, username, fullName, passwordHash, 1000.00],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store session
    await new Promise((resolve, reject) => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      db.run(
        'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [userId, jwt.sign({ userId }, process.env.JWT_SECRET), expiresAt.toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: userId,
        email,
        username,
        fullName,
        walletBalance: 1000.00,
        profilePictureUrl: null
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }

    const { email, password } = value;

    // Find user
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE email = ? AND is_active = 1',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store session
    await new Promise((resolve, reject) => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      db.run(
        'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [user.id, jwt.sign({ userId: user.id }, process.env.JWT_SECRET), expiresAt.toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        walletBalance: user.wallet_balance,
        profilePictureUrl: user.profile_picture_url
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more sophisticated system, you'd invalidate the token
    // For now, we'll just return success
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

module.exports = router;
