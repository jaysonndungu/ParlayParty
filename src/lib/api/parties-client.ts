/**
 * ParlayParty Parties API Client
 * 
 * This file provides easy-to-use functions for interacting with the parties API.
 * It handles request/response formatting, error handling, and type safety.
 */

import {
  // Types
  Party,
  PartyMember,
  PartyStats,
  CreatePartyRequest,
  CreatePartyResponse,
  JoinPartyRequest,
  JoinPartyResponse,
  ListPartiesRequest,
  ListPartiesResponse,
  GetPartyRequest,
  GetPartyResponse,
  UpdatePartyRequest,
  UpdatePartyResponse,
  LeavePartyRequest,
  LeavePartyResponse,
  KickMemberRequest,
  KickMemberResponse,
  PartyErrorCodes,
  PartyEndpoints,
  GetPartyByJoinCodeResponse
} from './parties';
import { generateInviteCode, generateQRCode, generateQRCodeNative } from '../utils/party-utils';

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

export interface ApiClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class PartiesApiClient {
  private config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey || '',
      timeout: config.timeout || 10000,
      retries: config.retries || 3
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Get auth token from localStorage or window
    let authToken = this.config.apiKey;
    if (typeof window !== 'undefined') {
      authToken = authToken || localStorage.getItem('authToken') || (window as any).authToken;
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.code || 'HTTP_ERROR',
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.details
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('TIMEOUT', 'Request timed out');
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      throw new ApiError('NETWORK_ERROR', errorMessage);
    }
  }

  private async makeRequestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        return await this.makeRequest<T>(endpoint, options);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx) or certain server errors
        if (error instanceof ApiError && error.statusCode && error.statusCode < 500) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < this.config.retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError!;
  }

  // ============================================================================
  // PARTY CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new party
   */
  async createParty(request: CreatePartyRequest): Promise<CreatePartyResponse> {
    // Generate invite code
    const inviteCode = generateInviteCode();
    
    // Add invite code to request
    const requestWithInviteCode = {
      ...request,
      joinCode: inviteCode,
      maxParticipants: request.maxParticipants || 16
    };

    const response = await this.makeRequestWithRetry<CreatePartyResponse>(
      PartyEndpoints.CREATE_PARTY.split(' ')[1], // Extract path from "POST /api/parties"
      {
        method: 'POST',
        body: JSON.stringify(requestWithInviteCode),
      }
    );

    // Generate QR code for competitive parties
    if (response.success && response.data && request.type === 'competitive') {
      try {
        const qrCode = await generateQRCode(inviteCode, request.name);
        response.data.qrCode = qrCode;
      } catch (error) {
        console.warn('Failed to generate QR code:', error);
      }
    }

    return response;
  }

  /**
   * Get party details by ID
   */
  async getParty(partyId: string, includeMembers = false, includeStats = false): Promise<GetPartyResponse> {
    const params = new URLSearchParams();
    if (includeMembers) params.append('includeMembers', 'true');
    if (includeStats) params.append('includeStats', 'true');
    
    const queryString = params.toString();
    const endpoint = PartyEndpoints.GET_PARTY.split(' ')[1].replace(':partyId', partyId);
    
    return this.makeRequestWithRetry<GetPartyResponse>(
      queryString ? `${endpoint}?${queryString}` : endpoint
    );
  }

  /**
   * Update an existing party (creator only)
   */
  async updateParty(partyId: string, request: UpdatePartyRequest): Promise<UpdatePartyResponse> {
    return this.makeRequestWithRetry<UpdatePartyResponse>(
      PartyEndpoints.UPDATE_PARTY.split(' ')[1].replace(':partyId', partyId),
      {
        method: 'PUT',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Delete a party (creator only)
   */
  async deleteParty(partyId: string): Promise<{ success: boolean }> {
    return this.makeRequestWithRetry<{ success: boolean }>(
      PartyEndpoints.DELETE_PARTY.split(' ')[1].replace(':partyId', partyId),
      {
        method: 'DELETE',
      }
    );
  }

  // ============================================================================
  // PARTY INVITATION AND JOINING
  // ============================================================================

  /**
   * Join a party using invite code
   */
  async joinParty(request: JoinPartyRequest): Promise<JoinPartyResponse> {
    return this.makeRequestWithRetry<JoinPartyResponse>(
      PartyEndpoints.JOIN_PARTY.split(' ')[1],
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Get party details by join code (for joining)
   */
  async getPartyByJoinCode(joinCode: string): Promise<GetPartyByJoinCodeResponse> {
    return this.makeRequestWithRetry<GetPartyByJoinCodeResponse>(
      PartyEndpoints.GET_PARTY_BY_JOIN_CODE.split(' ')[1].replace(':joinCode', joinCode)
    );
  }

  /**
   * Validate join code without joining
   */
  async validateJoinCode(joinCode: string): Promise<{ valid: boolean; party?: Party }> {
    try {
      const response = await this.getPartyByJoinCode(joinCode);
      return {
        valid: response.success,
        party: response.data?.party
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Generate QR code for party invite
   */
  async generateQRCode(partyId: string): Promise<{ qrCode: string }> {
    return this.makeRequestWithRetry<{ qrCode: string }>(
      PartyEndpoints.GENERATE_QR_CODE.split(' ')[1].replace(':partyId', partyId),
      {
        method: 'POST',
      }
    );
  }

  // ============================================================================
  // PARTY LISTING AND DISCOVERY
  // ============================================================================

  /**
   * List parties with optional filters
   */
  async listParties(request: ListPartiesRequest = {}): Promise<ListPartiesResponse> {
    const params = new URLSearchParams();
    
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, String(item)));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    const queryString = params.toString();
    const endpoint = PartyEndpoints.LIST_PARTIES.split(' ')[1];
    
    return this.makeRequestWithRetry<ListPartiesResponse>(
      queryString ? `${endpoint}?${queryString}` : endpoint
    );
  }

  /**
   * List parties for the current user
   */
  async listMyParties(request: Omit<ListPartiesRequest, 'userId'> = {}): Promise<ListPartiesResponse> {
    return this.makeRequestWithRetry<ListPartiesResponse>(
      PartyEndpoints.LIST_MY_PARTIES.split(' ')[1],
      {
        method: 'GET',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Search parties by name, description, or tags
   */
  async searchParties(query: string, filters: Omit<ListPartiesRequest, 'userId'> = {}): Promise<ListPartiesResponse> {
    const params = new URLSearchParams({ q: query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, String(item)));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    return this.makeRequestWithRetry<ListPartiesResponse>(
      `${PartyEndpoints.SEARCH_PARTIES.split(' ')[1]}?${params.toString()}`
    );
  }

  // ============================================================================
  // PARTY MEMBERSHIP OPERATIONS
  // ============================================================================


  /**
   * Leave a party
   */
  async leaveParty(partyId: string): Promise<LeavePartyResponse> {
    return this.makeRequestWithRetry<LeavePartyResponse>(
      PartyEndpoints.LEAVE_PARTY.split(' ')[1].replace(':partyId', partyId),
      {
        method: 'POST',
      }
    );
  }

  /**
   * Kick a member from a party (creator only)
   */
  async kickMember(partyId: string, userId: string): Promise<KickMemberResponse> {
    return this.makeRequestWithRetry<KickMemberResponse>(
      PartyEndpoints.KICK_MEMBER.split(' ')[1].replace(':partyId', partyId),
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }
    );
  }

  /**
   * List party members
   */
  async listMembers(partyId: string): Promise<{ success: boolean; data?: { members: PartyMember[] } }> {
    return this.makeRequestWithRetry<{ success: boolean; data?: { members: PartyMember[] } }>(
      PartyEndpoints.LIST_MEMBERS.split(' ')[1].replace(':partyId', partyId)
    );
  }

  // ============================================================================
  // PARTY STATS AND ANALYTICS
  // ============================================================================

  /**
   * Get party statistics
   */
  async getPartyStats(partyId: string): Promise<{ success: boolean; data?: { stats: PartyStats } }> {
    return this.makeRequestWithRetry<{ success: boolean; data?: { stats: PartyStats } }>(
      PartyEndpoints.GET_PARTY_STATS.split(' ')[1].replace(':partyId', partyId)
    );
  }

  /**
   * Get party leaderboard
   */
  async getLeaderboard(partyId: string, limit = 10): Promise<{ success: boolean; data?: { leaderboard: PartyMember[] } }> {
    return this.makeRequestWithRetry<{ success: boolean; data?: { leaderboard: PartyMember[] } }>(
      `${PartyEndpoints.GET_LEADERBOARD.split(' ')[1].replace(':partyId', partyId)}?limit=${limit}`
    );
  }

  // ============================================================================
  // PARTY CODE OPERATIONS
  // ============================================================================

  /**
   * Generate a new join code for a party (creator only)
   */
  async regenerateJoinCode(partyId: string): Promise<{ success: boolean; data?: { joinCode: string } }> {
    return this.makeRequestWithRetry<{ success: boolean; data?: { joinCode: string } }>(
      PartyEndpoints.GENERATE_JOIN_CODE.split(' ')[1].replace(':partyId', partyId),
      {
        method: 'POST',
      }
    );
  }

}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a new API client instance
 */
export function createPartiesApiClient(config: ApiClientConfig): PartiesApiClient {
  return new PartiesApiClient(config);
}

/**
 * Default API client instance (configure with environment variables)
 */
export const partiesApi = createPartiesApiClient({
  baseUrl: (typeof window !== 'undefined' && (window as any).env?.NEXT_PUBLIC_API_BASE_URL) || 'http://10.90.171.235:3001',
  apiKey: (typeof window !== 'undefined' && (window as any).env?.NEXT_PUBLIC_API_KEY) || undefined,
  timeout: 10000,
  retries: 3,
});

// ============================================================================
// REACT HOOKS (moved to separate file)
// ============================================================================

// React hooks are now in parties-react-hooks.ts to avoid React dependency issues

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if an error is a specific API error
 */
export function isApiError(error: unknown, code?: string): error is ApiError {
  if (!(error instanceof ApiError)) return false;
  return code ? error.code === code : true;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Format party data for display
 */
export function formatPartyForDisplay(party: Party): {
  id: string;
  name: string;
  type: string;
  status: string;
  dateRange: string;
  participants: string;
  prizePool?: string;
} {
  const startDate = new Date(party.startDate).toLocaleDateString();
  const endDate = new Date(party.endDate).toLocaleDateString();
  
  return {
    id: party.id,
    name: party.name,
    type: party.type === 'friendly' ? 'Friendly' : 'Competitive',
    status: party.status.charAt(0).toUpperCase() + party.status.slice(1),
    dateRange: `${startDate} - ${endDate}`,
    participants: `${party.currentParticipants}${party.maxParticipants ? `/${party.maxParticipants}` : ''}`,
    prizePool: party.prizePool ? `$${party.prizePool.toFixed(2)}` : undefined,
  };
}
