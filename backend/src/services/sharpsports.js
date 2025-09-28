const axios = require('axios');

class SharpSportsAPI {
  constructor() {
    // SharpSports API configuration
    this.baseURL = process.env.SHARPSPORTS_API_URL || 'https://api.sharpsports.io/v1';
    this.apiKey = process.env.SHARPSPORTS_API_KEY || 'sandbox_api_key_here';
    this.clientId = process.env.SHARPSPORTS_CLIENT_ID || 'sandbox_client_id_here';
    this.isSandbox = process.env.NODE_ENV !== 'production';
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Client-ID': this.clientId
      },
      timeout: 10000
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`SharpSports API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('SharpSports API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`SharpSports API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('SharpSports API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Initialize account linking for PrizePicks
   * @param {string} userId - User ID from our system
   * @returns {Object} Link data for frontend
   */
  async initializeAccountLinking(userId) {
    try {
      const response = await this.client.post('/booklink/initialize', {
        userId,
        platform: 'prizepicks',
        redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/callback/sharpsports`,
        sandbox: this.isSandbox
      });

      return {
        linkId: response.data.linkId,
        linkUrl: response.data.linkUrl,
        expiresAt: response.data.expiresAt
      };
    } catch (error) {
      console.error('Failed to initialize account linking:', error);
      throw new Error('Failed to initialize PrizePicks account linking');
    }
  }

  /**
   * Get user's bet slips from PrizePicks
   * @param {string} userId - User ID from our system
   * @param {Object} options - Query options
   * @returns {Array} Array of bet slips
   */
  async getBetSlips(userId, options = {}) {
    try {
      const params = {
        userId,
        platform: 'prizepicks',
        ...options
      };

      const response = await this.client.get('/betslips', { params });
      return response.data.betSlips || [];
    } catch (error) {
      console.error('Failed to fetch bet slips:', error);
      // Return mock data in sandbox mode
      if (this.isSandbox) {
        return this.getMockBetSlips();
      }
      throw new Error('Failed to fetch PrizePicks data');
    }
  }

  /**
   * Get user's account balance and stats
   * @param {string} userId - User ID from our system
   * @returns {Object} Account information
   */
  async getAccountInfo(userId) {
    try {
      const response = await this.client.get(`/accounts/${userId}`, {
        params: { platform: 'prizepicks' }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch account info:', error);
      // Return mock data in sandbox mode
      if (this.isSandbox) {
        return this.getMockAccountInfo();
      }
      throw new Error('Failed to fetch account information');
    }
  }

  /**
   * Refresh user's connected accounts
   * @param {string} userId - User ID from our system
   * @returns {Object} Refresh status
   */
  async refreshAccount(userId) {
    try {
      const response = await this.client.post(`/accounts/${userId}/refresh`, {
        platform: 'prizepicks'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to refresh account:', error);
      throw new Error('Failed to refresh PrizePicks account');
    }
  }

  /**
   * Handle webhook events from SharpSports
   * @param {Object} payload - Webhook payload
   * @returns {Object} Processing result
   */
  async handleWebhook(payload) {
    try {
      console.log('Received SharpSports webhook:', payload);
      
      // Handle different webhook types
      switch (payload.type) {
        case 'account.connected':
          return await this.handleAccountConnected(payload);
        case 'account.disconnected':
          return await this.handleAccountDisconnected(payload);
        case 'betslip.created':
          return await this.handleBetSlipCreated(payload);
        case 'betslip.updated':
          return await this.handleBetSlipUpdated(payload);
        default:
          console.log('Unknown webhook type:', payload.type);
          return { processed: false, message: 'Unknown webhook type' };
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw new Error('Failed to process webhook');
    }
  }

  /**
   * Handle account connected webhook
   */
  async handleAccountConnected(payload) {
    // Update user's connection status in database
    console.log('Account connected:', payload.data);
    return { processed: true, message: 'Account connected successfully' };
  }

  /**
   * Handle account disconnected webhook
   */
  async handleAccountDisconnected(payload) {
    // Update user's connection status in database
    console.log('Account disconnected:', payload.data);
    return { processed: true, message: 'Account disconnected successfully' };
  }

  /**
   * Handle new bet slip created webhook
   */
  async handleBetSlipCreated(payload) {
    // Process new bet slip data
    console.log('New bet slip created:', payload.data);
    return { processed: true, message: 'Bet slip processed successfully' };
  }

  /**
   * Handle bet slip updated webhook
   */
  async handleBetSlipUpdated(payload) {
    // Process updated bet slip data
    console.log('Bet slip updated:', payload.data);
    return { processed: true, message: 'Bet slip update processed successfully' };
  }

  /**
   * Get mock bet slips for sandbox mode
   */
  getMockBetSlips() {
    return [
      {
        id: 'mock_bet_1',
        platform: 'prizepicks',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'won',
        totalOdds: 3.25,
        stake: 10.00,
        potentialWin: 32.50,
        actualWin: 32.50,
        picks: [
          {
            id: 'pick_1',
            player: 'Patrick Mahomes',
            prop: 'Passing Yards',
            line: 265.5,
            direction: 'over',
            odds: 1.85,
            status: 'won',
            actualValue: 287
          },
          {
            id: 'pick_2',
            player: 'Travis Kelce',
            prop: 'Receptions',
            line: 6.5,
            direction: 'over',
            odds: 1.75,
            status: 'won',
            actualValue: 8
          }
        ]
      },
      {
        id: 'mock_bet_2',
        platform: 'prizepicks',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        totalOdds: 4.20,
        stake: 15.00,
        potentialWin: 63.00,
        picks: [
          {
            id: 'pick_3',
            player: 'Josh Allen',
            prop: 'Passing Yards',
            line: 275.5,
            direction: 'over',
            odds: 1.90,
            status: 'pending',
            gameTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'pick_4',
            player: 'Stefon Diggs',
            prop: 'Receiving Yards',
            line: 85.5,
            direction: 'over',
            odds: 1.80,
            status: 'pending',
            gameTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'mock_bet_3',
        platform: 'prizepicks',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'lost',
        totalOdds: 5.50,
        stake: 20.00,
        potentialWin: 110.00,
        actualWin: 0,
        picks: [
          {
            id: 'pick_5',
            player: 'Lamar Jackson',
            prop: 'Rushing Yards',
            line: 45.5,
            direction: 'over',
            odds: 1.85,
            status: 'lost',
            actualValue: 32
          },
          {
            id: 'pick_6',
            player: 'Mark Andrews',
            prop: 'Receiving Yards',
            line: 55.5,
            direction: 'over',
            odds: 1.75,
            status: 'won',
            actualValue: 67
          }
        ]
      }
    ];
  }

  /**
   * Get mock account info for sandbox mode
   */
  getMockAccountInfo() {
    return {
      platform: 'prizepicks',
      connected: true,
      accountBalance: 245.50,
      totalDeposits: 500.00,
      totalWithdrawals: 254.50,
      totalWagered: 1250.75,
      totalWon: 980.25,
      winRate: 0.62,
      averageOdds: 2.15,
      longestWinStreak: 8,
      currentStreak: 3,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      connectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
}

module.exports = SharpSportsAPI;
