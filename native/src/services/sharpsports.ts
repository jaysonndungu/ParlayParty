// SharpSports API service for React Native
export interface BetSlip {
  id: string;
  platform: string;
  createdAt: string;
  status: 'won' | 'lost' | 'pending' | 'cancelled';
  totalOdds: number;
  stake: number;
  potentialWin: number;
  actualWin?: number;
  picks: BetPick[];
}

export interface BetPick {
  id: string;
  player: string;
  prop: string;
  line: number;
  direction: 'over' | 'under';
  odds: number;
  status: 'won' | 'lost' | 'pending' | 'cancelled';
  actualValue?: number;
  gameTime?: string;
}

export interface AccountInfo {
  platform: string;
  connected: boolean;
  accountBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalWagered: number;
  totalWon: number;
  winRate: number;
  averageOdds: number;
  longestWinStreak: number;
  currentStreak: number;
  lastActivity: string;
  connectedAt: string;
}

export interface PrizePicksStats {
  totalBalance: number;
  totalWagered: number;
  totalWon: number;
  winRate: number;
  currentStreak: number;
  recentBets: Array<{
    id: string;
    status: string;
    stake: number;
    potentialWin: number;
    actualWin?: number;
    createdAt: string;
    picksCount: number;
  }>;
  connected: boolean;
}

export interface LinkData {
  linkId: string;
  linkUrl: string;
  expiresAt: string;
}

class SharpSportsService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    // Use your computer's IP address for mobile testing
    // Replace with your actual IP address - try these common ones:
    this.baseURL = 'http://192.168.1.100:3001/api'; // Common home network IP
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }

    return data.data;
  }

  /**
   * Initialize PrizePicks account linking
   */
  async initializeAccountLinking(): Promise<LinkData> {
    return this.request<LinkData>('/sharpsports/link/initialize', {
      method: 'POST',
    });
  }

  /**
   * Get user's PrizePicks bet slips
   */
  async getBetSlips(options: {
    limit?: number;
    offset?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{ betSlips: BetSlip[]; pagination: any }> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.status) params.append('status', options.status);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);

    const query = params.toString();
    return this.request<{ betSlips: BetSlip[]; pagination: any }>(`/sharpsports/betslips?${query}`);
  }

  /**
   * Get user's PrizePicks account info
   */
  async getAccountInfo(): Promise<AccountInfo> {
    return this.request<AccountInfo>('/sharpsports/account');
  }

  /**
   * Refresh user's PrizePicks account data
   */
  async refreshAccount(): Promise<any> {
    return this.request('/sharpsports/account/refresh', {
      method: 'POST',
    });
  }

  /**
   * Get PrizePicks stats for the parties tab
   */
  async getStats(): Promise<PrizePicksStats> {
    // Use demo endpoint for testing without authentication
    return this.request<PrizePicksStats>('/sharpsports/demo');
  }
}

export const sharpSportsService = new SharpSportsService();
