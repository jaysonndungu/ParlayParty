/**
 * API Contracts for ParlayParty Parties
 * 
 * This file defines the TypeScript types and API contracts for party-related operations
 * including creating, joining, and listing parties.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type PartyType = 'friendly' | 'competitive';

export type Sport = 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'NCAAB' | 'NCAAF' | 'NHL' | 'MLS' | 'UFC';

export interface Party {
  id: string;
  name: string;
  type: PartyType;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  createdBy: string; // User ID
  joinCode: string; // Unique permanent invite code
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  
  // Competitive party specific fields
  buyIn?: number;
  prizePool?: number;
  allowedSports?: Sport[];
  maxParticipants: number; // Always 16 for now
  currentParticipants: number;
  
  // QR Code for competitive parties
  qrCode?: string; // QR code data URL for competitive parties
  
  // Evaluation settings
  evaluationLimit?: number; // Max number of parlays to evaluate per user
  evaluationPeriod?: 'daily' | 'weekly' | 'monthly';
  
  // Metadata
  description?: string;
  tags?: string[];
  isPrivate: boolean;
  
  // Party members
  members: PartyMember[];
}

export interface PartyMember {
  userId: string;
  username: string;
  displayName: string;
  profilePhotoUrl?: string;
  joinedAt: string; // ISO datetime string
  isCreator: boolean;
  isActive: boolean;
  totalScore: number;
  buyInPaid?: number;
  lastActiveAt: string; // ISO datetime string
}

export interface PartyStats {
  totalMembers: number;
  activeMembers: number;
  totalParlays: number;
  totalPrizePool: number;
  averageScore: number;
  topPerformer: {
    userId: string;
    username: string;
    score: number;
  };
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

// CREATE PARTY
export interface CreatePartyRequest {
  name: string;
  type: PartyType;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  description?: string;
  tags?: string[];
  isPrivate?: boolean;
  
  // Competitive party fields
  buyIn?: number;
  allowedSports?: Sport[];
  maxParticipants?: number;
  evaluationLimit?: number;
  evaluationPeriod?: 'daily' | 'weekly' | 'monthly';
}

export interface CreatePartyResponse {
  success: boolean;
  data?: {
    party: Party;
    joinCode: string;
    qrCode?: string; // QR code data URL for competitive parties
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// JOIN PARTY
export interface JoinPartyRequest {
  joinCode: string;
  userId: string;
  username: string;
  displayName: string;
  profilePhotoUrl?: string;
}

export interface JoinPartyResponse {
  success: boolean;
  data?: {
    party: Party;
    member: PartyMember;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// GET PARTY BY JOIN CODE
export interface GetPartyByJoinCodeRequest {
  joinCode: string;
}

export interface GetPartyByJoinCodeResponse {
  success: boolean;
  data?: {
    party: Party;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// UPDATE PARTY MEMBERS
export interface UpdatePartyMembersRequest {
  partyId: string;
  members: PartyMember[];
}

export interface JoinPartyResponse {
  success: boolean;
  data?: {
    party: Party;
    member: PartyMember;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// LIST PARTIES
export interface ListPartiesRequest {
  userId?: string; // If provided, returns parties for specific user
  type?: PartyType; // Filter by party type
  status?: 'active' | 'paused' | 'completed' | 'cancelled';
  sport?: Sport; // Filter by allowed sport
  isPrivate?: boolean;
  limit?: number; // Default: 20, Max: 100
  offset?: number; // Default: 0
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'participants' | 'prizePool';
  sortOrder?: 'asc' | 'desc'; // Default: 'desc'
}

export interface ListPartiesResponse {
  success: boolean;
  data?: {
    parties: Party[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

// GET PARTY DETAILS
export interface GetPartyRequest {
  partyId: string;
  includeMembers?: boolean;
  includeStats?: boolean;
}

export interface GetPartyResponse {
  success: boolean;
  data?: {
    party: Party;
    members?: PartyMember[];
    stats?: PartyStats;
  };
  error?: {
    code: string;
    message: string;
  };
}

// UPDATE PARTY
export interface UpdatePartyRequest {
  partyId: string;
  name?: string;
  description?: string;
  tags?: string[];
  status?: 'active' | 'paused' | 'completed' | 'cancelled';
  maxParticipants?: number;
  evaluationLimit?: number;
  evaluationPeriod?: 'daily' | 'weekly' | 'monthly';
}

export interface UpdatePartyResponse {
  success: boolean;
  data?: {
    party: Party;
  };
  error?: {
    code: string;
    message: string;
  };
}

// LEAVE PARTY
export interface LeavePartyRequest {
  partyId: string;
}

export interface LeavePartyResponse {
  success: boolean;
  data?: {
    refundAmount?: number; // For competitive parties
  };
  error?: {
    code: string;
    message: string;
  };
}

// KICK MEMBER (Creator only)
export interface KickMemberRequest {
  partyId: string;
  userId: string;
}

export interface KickMemberResponse {
  success: boolean;
  data?: {
    refundAmount?: number; // For competitive parties
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const CreatePartyValidation = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_]+$/
  },
  type: {
    required: true,
    enum: ['friendly', 'competitive'] as const
  },
  startDate: {
    required: true,
    format: 'ISO date string (YYYY-MM-DD)',
    minDate: 'today',
    maxDate: '1 year from today'
  },
  endDate: {
    required: true,
    format: 'ISO date string (YYYY-MM-DD)',
    minDate: 'startDate + 1 day',
    maxDate: 'startDate + 1 year'
  },
  buyIn: {
    required: false,
    min: 0.01,
    max: 10000,
    precision: 2
  },
  allowedSports: {
    required: false,
    minItems: 1,
    maxItems: 10,
    enum: ['NFL', 'NBA', 'MLB', 'NHL', 'NCAAB', 'NCAAF', 'MLS', 'UFC'] as const
  },
  maxParticipants: {
    required: false,
    min: 2,
    max: 100
  },
  evaluationLimit: {
    required: false,
    min: 1,
    max: 1000
  }
};

export const JoinPartyValidation = {
  joinCode: {
    required: true,
    minLength: 6,
    maxLength: 12,
    pattern: /^[A-Z0-9]+$/
  },
  buyIn: {
    required: false, // Required for competitive parties
    min: 0.01,
    max: 10000,
    precision: 2
  }
};

// ============================================================================
// ERROR CODES
// ============================================================================

export enum PartyErrorCodes {
  // General errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  
  // Party creation errors
  INVALID_PARTY_TYPE = 'INVALID_PARTY_TYPE',
  INVALID_DATES = 'INVALID_DATES',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_BUY_IN = 'INVALID_BUY_IN',
  INVALID_SPORTS = 'INVALID_SPORTS',
  PARTY_NAME_TAKEN = 'PARTY_NAME_TAKEN',
  
  // Party joining errors
  INVALID_JOIN_CODE = 'INVALID_JOIN_CODE',
  PARTY_FULL = 'PARTY_FULL',
  PARTY_CLOSED = 'PARTY_CLOSED',
  ALREADY_MEMBER = 'ALREADY_MEMBER',
  INSUFFICIENT_FUNDS_JOIN = 'INSUFFICIENT_FUNDS_JOIN',
  BUY_IN_MISMATCH = 'BUY_IN_MISMATCH',
  
  // Party management errors
  NOT_PARTY_CREATOR = 'NOT_PARTY_CREATOR',
  CANNOT_LEAVE_OWN_PARTY = 'CANNOT_LEAVE_OWN_PARTY',
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  PARTY_ALREADY_STARTED = 'PARTY_ALREADY_STARTED',
  PARTY_ALREADY_ENDED = 'PARTY_ALREADY_ENDED'
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const PartyEndpoints = {
  // Party CRUD
  CREATE_PARTY: 'POST /api/parties',
  GET_PARTY: 'GET /api/parties/:partyId',
  UPDATE_PARTY: 'PUT /api/parties/:partyId',
  DELETE_PARTY: 'DELETE /api/parties/:partyId',
  
  // Party listing and discovery
  LIST_PARTIES: 'GET /api/parties',
  LIST_MY_PARTIES: 'GET /api/parties/my',
  SEARCH_PARTIES: 'GET /api/parties/search',
  
  // Party membership
  JOIN_PARTY: 'POST /api/parties/join',
  LEAVE_PARTY: 'POST /api/parties/:partyId/leave',
  KICK_MEMBER: 'POST /api/parties/:partyId/kick',
  LIST_MEMBERS: 'GET /api/parties/:partyId/members',
  
  // Invite codes and QR codes
  GET_PARTY_BY_JOIN_CODE: 'GET /api/parties/join/:joinCode',
  GENERATE_QR_CODE: 'POST /api/parties/:partyId/qr-code',
  VALIDATE_JOIN_CODE: 'GET /api/parties/validate/:joinCode',
  
  // Party stats and analytics
  GET_PARTY_STATS: 'GET /api/parties/:partyId/stats',
  GET_LEADERBOARD: 'GET /api/parties/:partyId/leaderboard',
  
  // Party codes
  GENERATE_JOIN_CODE: 'POST /api/parties/:partyId/regenerate-code'
} as const;

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Creating a friendly party
 */
export const exampleCreateFriendlyParty: CreatePartyRequest = {
  name: "Sunday Funday NFL Party",
  type: "friendly",
  startDate: "2024-01-14",
  endDate: "2024-01-21",
  description: "Weekly NFL parlay competition with friends",
  tags: ["NFL", "Sunday", "Friends"],
  isPrivate: false
};

/**
 * Example: Creating a competitive party
 */
export const exampleCreateCompetitiveParty: CreatePartyRequest = {
  name: "High Stakes NBA Championship",
  type: "competitive",
  startDate: "2024-01-15",
  endDate: "2024-06-15",
  description: "NBA playoffs parlay competition with $50 buy-in",
  tags: ["NBA", "Playoffs", "High Stakes"],
  isPrivate: false,
  buyIn: 50.00,
  allowedSports: ["NBA"],
  maxParticipants: 20,
  evaluationLimit: 10,
  evaluationPeriod: "weekly"
};

/**
 * Example: Joining a party
 */
export const exampleJoinParty: JoinPartyRequest = {
  joinCode: "ABC123",
  userId: "user123",
  username: "johndoe",
  displayName: "John Doe",
  profilePhotoUrl: "https://example.com/photo.jpg"
};

/**
 * Example: Listing parties with filters
 */
export const exampleListParties: ListPartiesRequest = {
  type: "competitive",
  status: "active",
  sport: "NFL",
  limit: 10,
  offset: 0,
  sortBy: "prizePool",
  sortOrder: "desc"
};
