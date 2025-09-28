const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/init');

// Create a new party
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      type,
      startDate,
      endDate,
      buyIn = 0,
      allowedSports = ['NFL', 'NBA'],
      description = null,
      isPrivate = false
    } = req.body;

    // Generate unique join code
    const generateJoinCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const joinCode = generateJoinCode();

    // Insert party into database
    const party = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO parties (name, type, creator_id, start_date, end_date, buy_in_amount, prize_pool, allowed_sports, max_members, current_participants, join_code, description, is_private, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [name, type, req.user.id, startDate, endDate, buyIn, 0, JSON.stringify(allowedSports), 16, 1, joinCode, description, isPrivate],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, joinCode });
        }
      );
    });

    // Add creator as first member
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO party_members (party_id, user_id, joined_at, is_creator, is_active, buy_in_paid)
         VALUES (?, ?, datetime('now'), 1, 1, ?)`,
        [party.id, req.user.id, buyIn],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      success: true,
      data: {
        party: {
          id: party.id,
          name,
          type,
          startDate,
          endDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: req.user.id,
          joinCode: party.joinCode,
          status: 'active',
          buyIn,
          prizePool: 0,
          allowedSports,
          maxParticipants: 16,
          currentParticipants: 1,
          description,
          isPrivate,
          members: [{
            id: req.user.id,
            username: req.user.username,
            displayName: req.user.fullName,
            joinedAt: new Date().toISOString(),
            isCreator: true,
            isActive: true
          }]
        },
        joinCode: party.joinCode
      }
    });
  } catch (error) {
    console.error('Error creating party:', error);
    res.status(500).json({ success: false, error: 'Failed to create party' });
  }
});

// Get user's parties
router.get('/my-parties', authenticateToken, async (req, res) => {
  try {
    const parties = await new Promise((resolve, reject) => {
      db.all(
        `SELECT DISTINCT p.* FROM parties p
         LEFT JOIN party_members pm ON p.id = pm.party_id
         WHERE p.creator_id = ? OR pm.user_id = ?`,
        [req.user.id, req.user.id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const formattedParties = parties.map(party => ({
      id: party.id,
      name: party.name,
      type: party.type,
      startDate: party.start_date,
      endDate: party.end_date,
      createdAt: party.created_at,
      updatedAt: party.updated_at,
      createdBy: party.creator_id,
      joinCode: party.join_code,
      status: 'active',
      buyIn: party.buy_in_amount,
      prizePool: party.prize_pool,
      allowedSports: JSON.parse(party.allowed_sports),
      maxParticipants: party.max_members,
      currentParticipants: party.current_participants,
      description: party.description,
      isPrivate: party.is_private
    }));

    res.json({
      success: true,
      data: { parties: formattedParties }
    });
  } catch (error) {
    console.error('Error fetching parties:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch parties' });
  }
});

// Join a party by join code
router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { joinCode, username, displayName, profilePhotoUrl } = req.body;

    // Find party by join code
    const party = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM parties WHERE join_code = ?',
        [joinCode],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!party) {
      return res.status(404).json({ success: false, error: 'Party not found' });
    }

    // Check if user is already a member
    const existingMember = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM party_members WHERE party_id = ? AND user_id = ?',
        [party.id, req.user.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingMember) {
      return res.status(400).json({ success: false, error: 'Already a member of this party' });
    }

    // Check max participants
    if (party.current_participants >= party.max_members) {
      return res.status(400).json({ success: false, error: 'Party is full' });
    }

    // Check buy-in requirements
    let buyInPaid = 0;
    if (party.type === 'competitive' && party.buy_in_amount > 0) {
      // Get user's wallet balance
      const user = await new Promise((resolve, reject) => {
        db.get(
          'SELECT wallet_balance FROM users WHERE id = ?',
          [req.user.id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (user.wallet_balance < party.buy_in_amount) {
        return res.status(400).json({ success: false, error: 'Insufficient funds' });
      }

      // Deduct buy-in from wallet
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?',
          [party.buy_in_amount, req.user.id],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      buyInPaid = party.buy_in_amount;
    }

    // Add member to party
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO party_members (party_id, user_id, joined_at, is_creator, is_active, buy_in_paid)
         VALUES (?, ?, datetime('now'), 0, 1, ?)`,
        [party.id, req.user.id, buyInPaid],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Update party participant count
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE parties SET current_participants = current_participants + 1 WHERE id = ?',
        [party.id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      success: true,
      data: {
        party: {
          id: party.id,
          name: party.name,
          type: party.type,
          startDate: party.start_date,
          endDate: party.end_date,
          createdAt: party.created_at,
          updatedAt: party.updated_at,
          createdBy: party.creator_id,
          joinCode: party.join_code,
          status: 'active',
          buyIn: party.buy_in_amount,
          prizePool: party.prize_pool,
          allowedSports: JSON.parse(party.allowed_sports),
          maxParticipants: party.max_members,
          currentParticipants: party.current_participants + 1,
          description: party.description,
          isPrivate: party.is_private
        }
      }
    });
  } catch (error) {
    console.error('Error joining party:', error);
    res.status(500).json({ success: false, error: 'Failed to join party' });
  }
});

module.exports = router;
