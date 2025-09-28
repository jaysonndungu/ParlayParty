/**
 * React Hooks for ParlayParty Parties API
 * 
 * This file contains React-specific hooks for the parties API.
 * Import this file only in React components.
 */

import { useState, useCallback } from 'react';
import { PartiesApiClient, ApiClientConfig, ApiError } from './parties-client';

// ============================================================================
// REACT HOOKS
// ============================================================================

export function usePartiesApi(config?: ApiClientConfig) {
  const [client] = useState(() => {
    if (config) {
      const { createPartiesApiClient } = require('./parties-client');
      return createPartiesApiClient(config);
    } else {
      const { partiesApi } = require('./parties-client');
      return partiesApi;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async <T>(operation: (client: PartiesApiClient) => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation(client);
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('UNKNOWN_ERROR', err instanceof Error ? err.message : 'Unknown error');
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return {
    client,
    loading,
    error,
    execute,
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for party creation with invite code and QR code generation
 */
export function useCreateParty() {
  const { client, loading, error, execute } = usePartiesApi();
  const [createdParty, setCreatedParty] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');

  const createParty = useCallback(async (request: any) => {
    const result = await execute(async (client: PartiesApiClient) => {
      return await client.createParty(request);
    });

    if (result?.success && result.data) {
      setCreatedParty(result.data.party);
      setInviteCode(result.data.joinCode);
      setQrCode(result.data.qrCode || '');
    }

    return result;
  }, [execute]);

  const reset = useCallback(() => {
    setCreatedParty(null);
    setInviteCode('');
    setQrCode('');
  }, []);

  return {
    createParty,
    createdParty,
    inviteCode,
    qrCode,
    loading,
    error,
    reset,
  };
}

/**
 * Hook for joining parties by invite code
 */
export function useJoinParty() {
  const { client, loading, error, execute } = usePartiesApi();
  const [joinedParty, setJoinedParty] = useState<any>(null);

  const joinParty = useCallback(async (request: any) => {
    const result = await execute(async (client: PartiesApiClient) => {
      return await client.joinParty(request);
    });

    if (result?.success && result.data) {
      setJoinedParty(result.data.party);
    }

    return result;
  }, [execute]);

  const validateJoinCode = useCallback(async (joinCode: string) => {
    const result = await execute(async (client: PartiesApiClient) => {
      return await client.validateJoinCode(joinCode);
    });

    return result;
  }, [execute]);

  const getPartyByJoinCode = useCallback(async (joinCode: string) => {
    const result = await execute(async (client: PartiesApiClient) => {
      return await client.getPartyByJoinCode(joinCode);
    });

    return result;
  }, [execute]);

  const reset = useCallback(() => {
    setJoinedParty(null);
  }, []);

  return {
    joinParty,
    validateJoinCode,
    getPartyByJoinCode,
    joinedParty,
    loading,
    error,
    reset,
  };
}

/**
 * Hook for managing party invitations
 */
export function usePartyInvitations() {
  const { client, loading, error, execute } = usePartiesApi();
  const [qrCode, setQrCode] = useState<string>('');

  const generateQRCode = useCallback(async (partyId: string) => {
    const result = await execute(async (client: PartiesApiClient) => {
      return await client.generateQRCode(partyId);
    });

    if (result?.qrCode) {
      setQrCode(result.qrCode);
    }

    return result;
  }, [execute]);

  const reset = useCallback(() => {
    setQrCode('');
  }, []);

  return {
    generateQRCode,
    qrCode,
    loading,
    error,
    reset,
  };
}
