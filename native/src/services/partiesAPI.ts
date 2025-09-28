/**
 * React Native Parties API Client
 * 
 * This file provides easy-to-use functions for interacting with the parties API
 * from React Native, with proper authentication handling.
 */

import { authAPI } from './authAPI';

// ============================================================================
// TYPES
// ============================================================================

export interface Party {
  id: string;
  name: string;
  type: 'friendly' | 'competitive';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  joinCode: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  buyIn?: number;
  prizePool?: number;
  allowedSports?: string[];
  maxParticipants: number;
  currentParticipants: number;
  description?: string;
  isPrivate: boolean;
  members: PartyMember[];
}

export interface PartyMember {
  id: string;
  username: string;
  displayName: string;
  profilePhotoUrl?: string;
  joinedAt: string;
  isCreator: boolean;
  isActive: boolean;
}

export interface CreatePartyRequest {
  name: string;
  type: 'friendly' | 'competitive';
  startDate: string;
  endDate: string;
  buyIn?: number;
  allowedSports?: string[];
  evaluationLimit?: number;
  description?: string;
  isPrivate?: boolean;
}

export interface JoinPartyRequest {
  joinCode: string;
  username: string;
  displayName: string;
  profilePhotoUrl?: string;
}

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_BASE_URL = 'http://localhost:3001/api';

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class PartiesAPIClient {
  private authToken: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // CREATE PARTY
  // ============================================================================

  async createParty(request: CreatePartyRequest): Promise<{ success: boolean; data?: { party: Party; joinCode: string } }> {
    return this.makeRequest('/parties', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ============================================================================
  // LIST PARTIES
  // ============================================================================

  async listMyParties(): Promise<{ success: boolean; data?: { parties: Party[] } }> {
    return this.makeRequest('/parties');
  }

  // ============================================================================
  // JOIN PARTY
  // ============================================================================

  async joinParty(request: JoinPartyRequest): Promise<{ success: boolean; data?: { party: Party } }> {
    return this.makeRequest('/parties/join', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ============================================================================
  // GET PARTY
  // ============================================================================

  async getParty(partyId: string): Promise<{ success: boolean; data?: { party: Party } }> {
    return this.makeRequest(`/parties/${partyId}`);
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const partiesAPI = new PartiesAPIClient();
