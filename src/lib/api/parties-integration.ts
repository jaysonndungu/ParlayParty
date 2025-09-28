/**
 * ParlayParty Parties Integration Examples
 * 
 * This file shows how to integrate the new API contracts with your existing
 * React Native and Next.js codebase.
 */

import { partiesApi, formatPartyForDisplay } from './parties-client';
import { usePartiesApi } from './parties-react-hooks';
import { Party, CreatePartyRequest, JoinPartyRequest } from './parties';

// ============================================================================
// REACT NATIVE INTEGRATION
// ============================================================================

/**
 * Example: Update your existing AppStore to use the new API
 * This shows how to replace the mock data with real API calls
 */

// In your AppStore.tsx, you can now replace the mock functions with:

export const createPartyWithApi = async (
  name: string,
  type: 'friendly' | 'competitive',
  startDate: string,
  endDate: string,
  buyIn?: number,
  allowedSports?: string[],
  evalLimit?: number
) => {
  try {
    const request: CreatePartyRequest = {
      name,
      type,
      startDate,
      endDate,
      // Add other fields as needed
      ...(type === 'competitive' && {
        buyIn,
        allowedSports,
        evaluationLimit: evalLimit,
      }),
    };

    const response = await partiesApi.createParty(request);
    
    if (response.success && response.data) {
      // Update your local state with the new party
      return response.data.party;
    } else {
      throw new Error(response.error?.message || 'Failed to create party');
    }
  } catch (error) {
    console.error('Error creating party:', error);
    throw error;
  }
};

export const joinPartyWithApi = async (joinCode: string, buyIn?: number) => {
  try {
    const request: JoinPartyRequest = {
      joinCode,
      ...(buyIn && { buyIn }),
    };

    const response = await partiesApi.joinParty(request);
    
    if (response.success && response.data) {
      // Update your local state with the joined party
      return response.data.party;
    } else {
      throw new Error(response.error?.message || 'Failed to join party');
    }
  } catch (error) {
    console.error('Error joining party:', error);
    throw error;
  }
};

// ============================================================================
// REACT HOOKS FOR YOUR COMPONENTS
// ============================================================================

/**
 * Custom hook for managing parties in your React Native app
 */
export function usePartiesManagement() {
  const { loading, error, execute } = usePartiesApi();

  const createParty = async (partyData: CreatePartyRequest) => {
    return execute(client => client.createParty(partyData));
  };

  const joinParty = async (joinData: JoinPartyRequest) => {
    return execute(client => client.joinParty(joinData));
  };

  const listMyParties = async () => {
    return execute(client => client.listMyParties());
  };

  const getPartyDetails = async (partyId: string) => {
    return execute(client => client.getParty(partyId, true, true));
  };

  const leaveParty = async (partyId: string) => {
    return execute(client => client.leaveParty(partyId));
  };

  return {
    loading,
    error,
    createParty,
    joinParty,
    listMyParties,
    getPartyDetails,
    leaveParty,
  };
}

// ============================================================================
// COMPONENT INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example: Updated PartiesScreen component
 * This shows how to integrate the API with your existing UI
 */

export const usePartiesScreenLogic = () => {
  const { loading, error, createParty, joinParty, listMyParties } = usePartiesManagement();
  // Note: In a real React component, you would use useState and useEffect here
  // const [parties, setParties] = useState<Party[]>([]);
  // const [refreshing, setRefreshing] = useState(false);
  const parties: Party[] = []; // Mock for now
  const refreshing = false; // Mock for now

  // Load parties on component mount
  // useEffect(() => {
  //   loadParties();
  // }, []);

  const loadParties = async () => {
    const result = await listMyParties();
    if (result?.success && result.data) {
      // In a real React component: setParties(result.data.parties);
      console.log('Parties loaded:', result.data.parties);
    }
  };

  const handleCreateParty = async (partyData: CreatePartyRequest) => {
    const result = await createParty(partyData);
    if (result?.success && result.data) {
      // Refresh the parties list
      await loadParties();
      return result.data.party;
    }
    return null;
  };

  const handleJoinParty = async (joinCode: string, buyIn?: number) => {
    const result = await joinParty({ joinCode, buyIn });
    if (result?.success && result.data) {
      // Refresh the parties list
      await loadParties();
      return result.data.party;
    }
    return null;
  };

  const onRefresh = async () => {
    // In a real React component: setRefreshing(true);
    await loadParties();
    // In a real React component: setRefreshing(false);
  };

  return {
    parties,
    loading,
    error,
    refreshing,
    handleCreateParty,
    handleJoinParty,
    onRefresh,
  };
};

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform API party data to match your existing UI components
 */
export const transformPartyForUI = (apiParty: Party) => {
  return {
    id: apiParty.id,
    name: apiParty.name,
    type: apiParty.type,
    startDate: apiParty.startDate,
    endDate: apiParty.endDate,
    // Add any other fields your UI expects
    status: apiParty.status,
    currentParticipants: apiParty.currentParticipants,
    maxParticipants: apiParty.maxParticipants,
    prizePool: apiParty.prizePool,
    buyIn: apiParty.buyIn,
  };
};

/**
 * Transform your existing party data to API format
 */
export const transformUIToApiParty = (uiParty: any): CreatePartyRequest => {
  return {
    name: uiParty.name,
    type: uiParty.type,
    startDate: uiParty.startDate,
    endDate: uiParty.endDate,
    description: uiParty.description,
    tags: uiParty.tags,
    isPrivate: uiParty.isPrivate || false,
    ...(uiParty.type === 'competitive' && {
      buyIn: uiParty.buyIn,
      allowedSports: uiParty.allowedSports,
      maxParticipants: uiParty.maxParticipants,
      evaluationLimit: uiParty.evaluationLimit,
    }),
  };
};

// ============================================================================
// ERROR HANDLING HELPERS
// ============================================================================

/**
 * User-friendly error messages for common API errors
 */
export const getPartyErrorMessage = (error: any): string => {
  if (error?.code === 'INSUFFICIENT_FUNDS') {
    return 'Not enough funds in your wallet for this buy-in.';
  }
  if (error?.code === 'INVALID_JOIN_CODE') {
    return 'Invalid join code. Please check and try again.';
  }
  if (error?.code === 'PARTY_FULL') {
    return 'This party is full and not accepting new members.';
  }
  if (error?.code === 'ALREADY_MEMBER') {
    return 'You are already a member of this party.';
  }
  if (error?.code === 'INVALID_DATES') {
    return 'Invalid date range. End date must be after start date.';
  }
  if (error?.code === 'PARTY_CLOSED') {
    return 'This party is no longer accepting new members.';
  }
  
  return error?.message || 'An unexpected error occurred. Please try again.';
};

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Helper to migrate from your existing mock data to API data
 */
export const migrateMockDataToApi = async () => {
  // This function can help you migrate existing mock parties to the API
  // when you're ready to switch from local storage to real backend
  
  const existingParties = JSON.parse(localStorage.getItem('myParties') || '[]');
  
  for (const party of existingParties) {
    try {
      const apiParty = transformUIToApiParty(party);
      await partiesApi.createParty(apiParty);
      console.log(`Migrated party: ${party.name}`);
    } catch (error) {
      console.error(`Failed to migrate party ${party.name}:`, error);
    }
  }
};

// ============================================================================
// TESTING UTILITIES
// ============================================================================

/**
 * Mock API responses for testing
 */
export const mockApiResponses = {
  createParty: {
    success: true,
    data: {
      party: {
        id: 'test-party-123',
        name: 'Test Party',
        type: 'friendly',
        startDate: '2024-01-15',
        endDate: '2024-01-22',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-123',
        joinCode: 'ABC123',
        status: 'active',
        currentParticipants: 1,
        isPrivate: false,
      },
      joinCode: 'ABC123',
    },
  },
  
  joinParty: {
    success: true,
    data: {
      party: {
        id: 'test-party-123',
        name: 'Test Party',
        type: 'friendly',
        startDate: '2024-01-15',
        endDate: '2024-01-22',
        status: 'active',
        currentParticipants: 2,
      },
      member: {
        userId: 'user-456',
        username: 'testuser',
        displayName: 'Test User',
        joinedAt: new Date().toISOString(),
        isCreator: false,
        isActive: true,
        totalScore: 0,
        lastActiveAt: new Date().toISOString(),
      },
    },
  },
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: How to use in your existing PartiesScreen component
 */
export const examplePartiesScreenUsage = () => {
  const {
    parties,
    loading,
    error,
    handleCreateParty,
    handleJoinParty,
    onRefresh,
  } = usePartiesScreenLogic();

  // Your existing UI code can now use these values
  // The API integration is handled behind the scenes
  
  return {
    parties: parties.map(transformPartyForUI),
    loading,
    error: error ? getPartyErrorMessage(error) : null,
    onRefresh,
    onCreateParty: handleCreateParty,
    onJoinParty: handleJoinParty,
  };
};
