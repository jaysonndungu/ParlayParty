const express = require('express');
const router = express.Router();
const SharpSportsAPI = require('../services/sharpsports');
const { authenticateToken } = require('../middleware/auth');

const sharpSportsAPI = new SharpSportsAPI();

/**
 * Initialize PrizePicks account linking
 * POST /api/sharpsports/link/initialize
 */
router.post('/link/initialize', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const linkData = await sharpSportsAPI.initializeAccountLinking(userId);
    
    res.json({
      success: true,
      data: linkData
    });
  } catch (error) {
    console.error('Initialize linking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get user's PrizePicks bet slips
 * GET /api/sharpsports/betslips
 */
router.get('/betslips', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, status, startDate, endDate } = req.query;
    
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      startDate,
      endDate
    };

    const betSlips = await sharpSportsAPI.getBetSlips(userId, options);
    
    res.json({
      success: true,
      data: {
        betSlips,
        pagination: {
          limit: options.limit,
          offset: options.offset,
          total: betSlips.length
        }
      }
    });
  } catch (error) {
    console.error('Get bet slips error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get user's PrizePicks account info
 * GET /api/sharpsports/account
 */
router.get('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const accountInfo = await sharpSportsAPI.getAccountInfo(userId);
    
    res.json({
      success: true,
      data: accountInfo
    });
  } catch (error) {
    console.error('Get account info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Refresh user's PrizePicks account data
 * POST /api/sharpsports/account/refresh
 */
router.post('/account/refresh', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const refreshResult = await sharpSportsAPI.refreshAccount(userId);
    
    res.json({
      success: true,
      data: refreshResult
    });
  } catch (error) {
    console.error('Refresh account error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Handle SharpSports webhooks
 * POST /api/sharpsports/webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    // Verify webhook signature in production
    const signature = req.headers['x-sharpsports-signature'];
    if (process.env.NODE_ENV === 'production' && !signature) {
      return res.status(401).json({ error: 'Missing webhook signature' });
    }

    const result = await sharpSportsAPI.handleWebhook(req.body);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get PrizePicks stats for the parties tab
 * GET /api/sharpsports/stats
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get both account info and recent bet slips
    const [accountInfo, betSlips] = await Promise.all([
      sharpSportsAPI.getAccountInfo(userId),
      sharpSportsAPI.getBetSlips(userId, { limit: 10 })
    ]);

    // Calculate stats for the parties tab
    const stats = {
      totalBalance: accountInfo.accountBalance || 0,
      totalWagered: accountInfo.totalWagered || 0,
      totalWon: accountInfo.totalWon || 0,
      winRate: accountInfo.winRate || 0,
      currentStreak: accountInfo.currentStreak || 0,
      recentBets: betSlips.slice(0, 5).map(bet => ({
        id: bet.id,
        status: bet.status,
        stake: bet.stake,
        potentialWin: bet.potentialWin,
        actualWin: bet.actualWin,
        createdAt: bet.createdAt,
        picksCount: bet.picks?.length || 0
      })),
      connected: accountInfo.connected || false
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Demo route for testing without authentication
 * GET /api/sharpsports/demo
 */
router.get('/demo', async (req, res) => {
  try {
    // Return mock data for demo purposes
    const mockStats = {
      totalBalance: 245.50,
      totalWagered: 1250.75,
      totalWon: 980.25,
      winRate: 0.62,
      currentStreak: 3,
      recentBets: [
        {
          id: 'demo_bet_1',
          status: 'won',
          stake: 10.00,
          potentialWin: 32.50,
          actualWin: 32.50,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          picksCount: 2
        },
        {
          id: 'demo_bet_2',
          status: 'pending',
          stake: 15.00,
          potentialWin: 63.00,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          picksCount: 2
        }
      ],
      connected: true
    };
    
    res.json({
      success: true,
      data: mockStats
    });
  } catch (error) {
    console.error('Demo route error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
