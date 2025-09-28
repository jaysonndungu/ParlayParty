const express = require('express');
const Joi = require('joi');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = getDatabase();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    user: req.user
  });
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updateSchema = Joi.object({
      fullName: Joi.string().min(2).max(100),
      profilePictureUrl: Joi.string().uri().allow(''),
      walletBalance: Joi.number().min(0)
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }

    const updates = [];
    const values = [];

    if (value.fullName !== undefined) {
      updates.push('full_name = ?');
      values.push(value.fullName);
    }

    if (value.profilePictureUrl !== undefined) {
      updates.push('profile_picture_url = ?');
      values.push(value.profilePictureUrl || null);
    }

    if (value.walletBalance !== undefined) {
      updates.push('wallet_balance = ?');
      values.push(value.walletBalance);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.user.id);

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Get updated user data
    const updatedUser = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, username, full_name, wallet_balance, profile_picture_url FROM users WHERE id = ?',
        [req.user.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        fullName: updatedUser.full_name,
        walletBalance: updatedUser.wallet_balance,
        profilePictureUrl: updatedUser.profile_picture_url
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's parties
router.get('/parties', authenticateToken, async (req, res) => {
  try {
    const parties = await new Promise((resolve, reject) => {
      db.all(
        `SELECT p.*, u.username as creator_username 
         FROM parties p 
         JOIN users u ON p.creator_id = u.id 
         JOIN party_members pm ON p.id = pm.party_id 
         WHERE pm.user_id = ? AND pm.is_active = 1`,
        [req.user.id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({ parties });

  } catch (error) {
    console.error('Get parties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add wallet funds (for testing/demo purposes)
router.post('/wallet/add', authenticateToken, async (req, res) => {
  try {
    const addFundsSchema = Joi.object({
      amount: Joi.number().min(1).max(10000).required()
    });

    const { error, value } = addFundsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }

    const newBalance = req.user.walletBalance + value.amount;

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET wallet_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newBalance, req.user.id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      message: 'Funds added successfully',
      newBalance,
      addedAmount: value.amount
    });

  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
