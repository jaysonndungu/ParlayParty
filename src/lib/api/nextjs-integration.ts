/**
 * Next.js Integration for ParlayParty API
 * 
 * This file shows how to integrate the parties API with your Next.js application.
 * It provides both client-side and server-side integration examples.
 */

import { partiesApi, createPartiesApiClient } from './parties-client';
import { CreatePartyRequest, JoinPartyRequest, Party } from './parties';

// ============================================================================
// SERVER-SIDE API ROUTES
// ============================================================================

/**
 * API Route: /api/parties (POST)
 * Create a new party
 */
export async function createPartyHandler(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { name, type, startDate, endDate, buyIn, allowedSports, evalLimit } = body;

    // Validate required fields
    if (!name || !type || !startDate || !endDate) {
      return Response.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Create party request
    const partyRequest: CreatePartyRequest = {
      name,
      type,
      startDate,
      endDate,
      description: `${type === 'friendly' ? 'Friendly' : 'Competitive'} party`,
      tags: [type, 'web-created'],
      isPrivate: false,
      ...(type === 'competitive' && {
        buyIn,
        allowedSports,
        maxParticipants: 20,
        evaluationLimit: evalLimit,
        evaluationPeriod: 'daily' as const,
      }),
    };

    // Call the API client
    const response = await partiesApi.createParty(partyRequest);

    if (response.success) {
      return Response.json(response, { status: 201 });
    } else {
      return Response.json(response, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating party:', error);
    return Response.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * API Route: /api/parties (GET)
 * List parties with optional filters
 */
export async function listPartiesHandler(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const params = {
      type: url.searchParams.get('type'),
      status: url.searchParams.get('status'),
      sport: url.searchParams.get('sport'),
      limit: url.searchParams.get('limit'),
      offset: url.searchParams.get('offset'),
    };

    // Convert string params to appropriate types
    const filters = {
      ...(params.type && { type: params.type as any }),
      ...(params.status && { status: params.status as any }),
      ...(params.sport && { sport: params.sport as any }),
      ...(params.limit && { limit: parseInt(params.limit) }),
      ...(params.offset && { offset: parseInt(params.offset) }),
    };

    const response = await partiesApi.listParties(filters);
    return Response.json(response);
  } catch (error) {
    console.error('Error listing parties:', error);
    return Response.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

/**
 * API Route: /api/parties/join (POST)
 * Join a party using join code
 */
export async function joinPartyHandler(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { joinCode, buyIn } = body;

    if (!joinCode) {
      return Response.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'Join code is required' } },
        { status: 400 }
      );
    }

    const joinRequest: JoinPartyRequest = {
      joinCode,
      ...(buyIn && { buyIn }),
    };

    const response = await partiesApi.joinParty(joinRequest);
    return Response.json(response);
  } catch (error) {
    console.error('Error joining party:', error);
    return Response.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// ============================================================================
// CLIENT-SIDE INTEGRATION
// ============================================================================

/**
 * Custom hook for parties in Next.js
 */
export function useParties() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createParty = async (partyData: CreatePartyRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partyData),
      });

      const result = await response.json();
      
      if (result.success) {
        setParties(prev => [result.data.party, ...prev]);
        return result;
      } else {
        setError(result.error?.message || 'Failed to create party');
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const joinParty = async (joinCode: string, buyIn?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/parties/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ joinCode, buyIn }),
      });

      const result = await response.json();
      
      if (result.success) {
        setParties(prev => [result.data.party, ...prev]);
        return result;
      } else {
        setError(result.error?.message || 'Failed to join party');
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const listParties = async (filters?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/parties?${queryParams.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setParties(result.data.parties);
        return result;
      } else {
        setError(result.error?.message || 'Failed to list parties');
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  return {
    parties,
    loading,
    error,
    createParty,
    joinParty,
    listParties,
  };
}

// ============================================================================
// SERVER-SIDE DATA FETCHING
// ============================================================================

/**
 * Server-side function to fetch parties
 */
export async function getParties(filters?: any): Promise<Party[]> {
  try {
    const response = await partiesApi.listParties(filters);
    return response.success && response.data ? response.data.parties : [];
  } catch (error) {
    console.error('Error fetching parties:', error);
    return [];
  }
}

/**
 * Server-side function to get party by ID
 */
export async function getPartyById(partyId: string): Promise<Party | null> {
  try {
    const response = await partiesApi.getParty(partyId, true, true);
    return response.success && response.data ? response.data.party : null;
  } catch (error) {
    console.error('Error fetching party:', error);
    return null;
  }
}

// ============================================================================
// FORM INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example: Create Party Form Component
 */
export function CreatePartyForm() {
  const { createParty, loading, error } = useParties();
  const [formData, setFormData] = useState({
    name: '',
    type: 'friendly' as const,
    startDate: '',
    endDate: '',
    buyIn: '',
    allowedSports: [] as string[],
    evalLimit: '5',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const partyData: CreatePartyRequest = {
      name: formData.name,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: `${formData.type === 'friendly' ? 'Friendly' : 'Competitive'} party`,
      tags: [formData.type, 'web-created'],
      isPrivate: false,
      ...(formData.type === 'competitive' && {
        buyIn: parseFloat(formData.buyIn),
        allowedSports: formData.allowedSports,
        maxParticipants: 20,
        evaluationLimit: parseInt(formData.evalLimit),
        evaluationPeriod: 'daily' as const,
      }),
    };

    const result = await createParty(partyData);
    
    if (result.success) {
      // Reset form
      setFormData({
        name: '',
        type: 'friendly',
        startDate: '',
        endDate: '',
        buyIn: '',
        allowedSports: [],
        evalLimit: '5',
      });
      
      // Show success message
      alert('Party created successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Party Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Party Type
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'friendly' | 'competitive' }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="friendly">Friendly</option>
          <option value="competitive">Competitive</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      {formData.type === 'competitive' && (
        <>
          <div>
            <label htmlFor="buyIn" className="block text-sm font-medium text-gray-700">
              Buy-in Amount ($)
            </label>
            <input
              type="number"
              id="buyIn"
              value={formData.buyIn}
              onChange={(e) => setFormData(prev => ({ ...prev, buyIn: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              min="0.01"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Allowed Sports
            </label>
            <div className="mt-2 space-y-2">
              {['NFL', 'NBA', 'MLB', 'NHL'].map((sport) => (
                <label key={sport} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.allowedSports.includes(sport)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          allowedSports: [...prev.allowedSports, sport]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          allowedSports: prev.allowedSports.filter(s => s !== sport)
                        }));
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{sport}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-indigo-600 py-2 px-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Party'}
      </button>
    </form>
  );
}

// ============================================================================
// PAGE INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example: Parties Page with Server-Side Rendering
 */
export async function PartiesPage() {
  // Fetch parties on the server
  const initialParties = await getParties({ status: 'active' });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Parties</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialParties.map((party) => (
          <div key={party.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900">{party.name}</h3>
            <p className="text-gray-600 capitalize">{party.type} Party</p>
            <p className="text-sm text-gray-500">
              {new Date(party.startDate).toLocaleDateString()} - {new Date(party.endDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              {party.currentParticipants} participants
            </p>
            {party.type === 'competitive' && party.prizePool && (
              <p className="text-sm font-medium text-green-600">
                Prize Pool: ${party.prizePool}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format party data for display
 */
export function formatParty(party: Party) {
  return {
    id: party.id,
    name: party.name,
    type: party.type === 'friendly' ? 'Friendly' : 'Competitive',
    status: party.status.charAt(0).toUpperCase() + party.status.slice(1),
    dateRange: `${new Date(party.startDate).toLocaleDateString()} - ${new Date(party.endDate).toLocaleDateString()}`,
    participants: `${party.currentParticipants}${party.maxParticipants ? `/${party.maxParticipants}` : ''}`,
    prizePool: party.prizePool ? `$${party.prizePool.toFixed(2)}` : undefined,
    joinCode: party.joinCode,
  };
}

/**
 * Validate party creation data
 */
export function validatePartyData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Party name is required');
  }

  if (!data.type || !['friendly', 'competitive'].includes(data.type)) {
    errors.push('Party type must be friendly or competitive');
  }

  if (!data.startDate) {
    errors.push('Start date is required');
  }

  if (!data.endDate) {
    errors.push('End date is required');
  }

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (end <= start) {
      errors.push('End date must be after start date');
    }
    
    const maxDuration = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    if (end.getTime() - start.getTime() > maxDuration) {
      errors.push('Party duration cannot exceed 1 year');
    }
  }

  if (data.type === 'competitive') {
    if (!data.buyIn || data.buyIn <= 0) {
      errors.push('Buy-in amount is required for competitive parties');
    }
    
    if (!data.allowedSports || data.allowedSports.length === 0) {
      errors.push('At least one sport must be selected for competitive parties');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
