const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const db = getDatabase();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Verify token exists in database
    db.get(
      'SELECT u.* FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.id = ? AND s.expires_at > ? AND u.is_active = 1',
      [decoded.userId, new Date().toISOString()],
      (err, user) => {
        if (err) {
          console.error('Database error during auth:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!user) {
          return res.status(403).json({ error: 'Invalid or expired session' });
        }

        req.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.full_name,
          walletBalance: user.wallet_balance,
          profilePictureUrl: user.profile_picture_url
        };

        next();
      }
    );
  });
}

module.exports = {
  authenticateToken
};
