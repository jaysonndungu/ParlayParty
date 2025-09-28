/**
 * ParlayParty Parties Service
 * 
 * This service integrates the API contracts with your existing app store
 * and provides a bridge between your current implementation and the new API.
 */

import { partiesApi, ApiError } from './parties-client';
import { CreatePartyRequest, JoinPartyRequest, Party, PartyType } from './parties';

// ============================================================================
// SERVICE CONFIGURATION
// ============================================================================

export interface PartiesServiceConfig {
  useApi: boolean; // Toggle between API and local storage
  apiBaseUrl?: string;
  apiKey?: string;
}

const defaultConfig: PartiesServiceConfig = {
  useApi: false, // Start with local storage, migrate to API later
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
};

// ============================================================================
// PARTIES SERVICE CLASS
// ============================================================================

export class PartiesService {
  private config: PartiesServiceConfig;
  private localParties: Party[] = [];
  private localPartyData: Map<string, any> = new Map();

  constructor(config: PartiesServiceConfig = defaultConfig) {
    this.config = { ...defaultConfig, ...config };
    
    // Initialize API client if using API
    if (this.config.useApi && this.config.apiBaseUrl) {
      // The partiesApi is already configured with environment variables
    }
  }

  // ============================================================================
  // CREATE PARTY
  // ============================================================================

  async createParty(
    name: string,
    type: PartyType,
    startDate: string,
    endDate: string,
    buyIn?: number,
    allowedSports?: string[],
    evalLimit?: number
  ): Promise<{ success: boolean; party?: Party; error?: string }> {
    try {
      if (this.config.useApi) {
        return await this.createPartyWithApi(name, type, startDate, endDate, buyIn, allowedSports, evalLimit);
      } else {
        return await this.createPartyLocally(name, type, startDate, endDate, buyIn, allowedSports, evalLimit);
      }
    } catch (error) {
      console.error('Error creating party:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async createPartyWithApi(
    name: string,
    type: PartyType,
    startDate: string,
    endDate: string,
    buyIn?: number,
    allowedSports?: string[],
    evalLimit?: number
  ): Promise<{ success: boolean; party?: Party; error?: string }> {
    const request: CreatePartyRequest = {
      name,
      type,
      startDate,
      endDate,
      description: `${type === 'friendly' ? 'Friendly' : 'Competitive'} party created via app`,
      tags: [type, 'app-created'],
      isPrivate: false,
      ...(type === 'competitive' && {
        buyIn,
        allowedSports,
        maxParticipants: 20,
        evaluationLimit: evalLimit,
        evaluationPeriod: 'daily' as const,
      }),
    };

    const response = await partiesApi.createParty(request);
    
    if (response.success && response.data) {
      return {
        success: true,
        party: response.data.party
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to create party'
      };
    }
  }

  private async createPartyLocally(
    name: string,
    type: PartyType,
    startDate: string,
    endDate: string,
    buyIn?: number,
    allowedSports?: string[],
    evalLimit?: number
  ): Promise<{ success: boolean; party?: Party; error?: string }> {
    // Generate ID and join code (same as your current implementation)
    const id = Math.random().toString(36).slice(2);
    const joinCode = this.generateJoinCode();
    const defaultName = type === "friendly" ? "Friendly Party" : "Competitive Party";
    
    const party: Party = {
      id,
      name: name.trim() || defaultName,
      type,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user', // You'll need to get this from your auth system
      joinCode,
      status: 'active',
      description: `${type === 'friendly' ? 'Friendly' : 'Competitive'} party`,
      tags: [type, 'local'],
      isPrivate: false,
      currentParticipants: 1,
      ...(type === 'competitive' && {
        buyIn,
        prizePool: buyIn || 0,
        maxParticipants: 20,
        allowedSports,
        evaluationLimit: evalLimit,
        evaluationPeriod: 'daily' as const,
      }),
    };

    // Store locally
    this.localParties.unshift(party);
    this.localPartyData.set(id, {
      scores: {},
      prizePool: type === 'competitive' ? buyIn : 0,
      picks: [],
      buyIns: type === 'competitive' ? { [id]: buyIn } : {},
      allowedSports: type === 'competitive' ? { [id]: allowedSports || ['NFL', 'NBA'] } : {},
      evalSettings: { [id]: { limit: evalLimit || 5, selected: [] } }
    });

    // Persist to localStorage
    this.persistLocalData();

    return {
      success: true,
      party
    };
  }

  // ============================================================================
  // JOIN PARTY
  // ============================================================================

  async joinParty(joinCode: string, buyIn?: number): Promise<{ success: boolean; party?: Party; error?: string }> {
    try {
      if (this.config.useApi) {
        return await this.joinPartyWithApi(joinCode, buyIn);
      } else {
        return await this.joinPartyLocally(joinCode, buyIn);
      }
    } catch (error) {
      console.error('Error joining party:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async joinPartyWithApi(joinCode: string, buyIn?: number): Promise<{ success: boolean; party?: Party; error?: string }> {
    const request: JoinPartyRequest = {
      joinCode,
      ...(buyIn && { buyIn }),
    };

    const response = await partiesApi.joinParty(request);
    
    if (response.success && response.data) {
      return {
        success: true,
        party: response.data.party
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to join party'
      };
    }
  }

  private async joinPartyLocally(joinCode: string, buyIn?: number): Promise<{ success: boolean; party?: Party; error?: string }> {
    const party = this.localParties.find(p => p.joinCode === joinCode);
    
    if (!party) {
      return {
        success: false,
        error: 'Invalid join code'
      };
    }

    if (party.status !== 'active') {
      return {
        success: false,
        error: 'Party is not accepting new members'
      };
    }

    if (party.type === 'competitive' && party.buyIn !== buyIn) {
      return {
        success: false,
        error: 'Buy-in amount does not match party requirements'
      };
    }

    // Update party participants
    party.currentParticipants += 1;
    
    // Update local data
    const partyData = this.localPartyData.get(party.id);
    if (partyData) {
      if (party.type === 'competitive' && buyIn) {
        partyData.prizePool += buyIn;
        partyData.buyIns['current-user'] = buyIn;
      }
    }

    this.persistLocalData();

    return {
      success: true,
      party
    };
  }

  // ============================================================================
  // LIST PARTIES
  // ============================================================================

  async listMyParties(): Promise<Party[]> {
    if (this.config.useApi) {
      try {
        const response = await partiesApi.listMyParties();
        return response.success && response.data ? response.data.parties : [];
      } catch (error) {
        console.error('Error listing parties:', error);
        return [];
      }
    } else {
      return this.localParties;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateJoinCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private persistLocalData(): void {
    try {
      localStorage.setItem('parlayparty_parties', JSON.stringify(this.localParties));
      localStorage.setItem('parlayparty_party_data', JSON.stringify(Array.from(this.localPartyData.entries())));
    } catch (error) {
      console.error('Error persisting local data:', error);
    }
  }

  private loadLocalData(): void {
    try {
      const partiesData = localStorage.getItem('parlayparty_parties');
      const partyDataData = localStorage.getItem('parlayparty_party_data');
      
      if (partiesData) {
        this.localParties = JSON.parse(partiesData);
      }
      
      if (partyDataData) {
        this.localPartyData = new Map(JSON.parse(partyDataData));
      }
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  // ============================================================================
  // MIGRATION METHODS
  // ============================================================================

  /**
   * Migrate from local storage to API
   */
  async migrateToApi(): Promise<{ success: boolean; migrated: number; errors: string[] }> {
    const errors: string[] = [];
    let migrated = 0;

    for (const party of this.localParties) {
      try {
        const result = await this.createPartyWithApi(
          party.name,
          party.type,
          party.startDate,
          party.endDate,
          party.buyIn,
          party.allowedSports,
          party.evaluationLimit
        );

        if (result.success) {
          migrated++;
        } else {
          errors.push(`Failed to migrate party "${party.name}": ${result.error}`);
        }
      } catch (error) {
        errors.push(`Error migrating party "${party.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      migrated,
      errors
    };
  }

  /**
   * Switch between local storage and API
   */
  switchToApi(apiBaseUrl?: string, apiKey?: string): void {
    this.config.useApi = true;
    if (apiBaseUrl) this.config.apiBaseUrl = apiBaseUrl;
    if (apiKey) this.config.apiKey = apiKey;
  }

  switchToLocal(): void {
    this.config.useApi = false;
    this.loadLocalData();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const partiesService = new PartiesService();

// ============================================================================
// REACT HOOKS FOR SERVICE
// ============================================================================

import { useState, useCallback } from 'react';

export function usePartiesService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createParty = useCallback(async (
    name: string,
    type: PartyType,
    startDate: string,
    endDate: string,
    buyIn?: number,
    allowedSports?: string[],
    evalLimit?: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await partiesService.createParty(name, type, startDate, endDate, buyIn, allowedSports, evalLimit);
      
      if (!result.success) {
        setError(result.error || 'Failed to create party');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const joinParty = useCallback(async (joinCode: string, buyIn?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await partiesService.joinParty(joinCode, buyIn);
      
      if (!result.success) {
        setError(result.error || 'Failed to join party');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const listMyParties = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const parties = await partiesService.listMyParties();
      return parties;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createParty,
    joinParty,
    listMyParties,
    service: partiesService,
  };
}
