/**
 * Party Utility Functions
 * 
 * Utility functions for party management including invite code generation,
 * QR code creation, and membership validation.
 */

// ============================================================================
// INVITE CODE GENERATION
// ============================================================================

/**
 * Generate a unique invite code for a party
 * Format: 6-character alphanumeric code (e.g., "ABC123")
 */
export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Validate invite code format
 */
export const isValidInviteCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};

// ============================================================================
// QR CODE GENERATION
// ============================================================================

/**
 * Generate QR code data URL for a party invite
 * This creates a QR code that contains the invite link
 */
export const generateQRCode = async (inviteCode: string, partyName: string): Promise<string> => {
  try {
    // For now, we'll create a simple data URL with the invite code
    // In a real implementation, you'd use a QR code library like 'qrcode'
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
    const qrData = {
      url: inviteUrl,
      partyName,
      inviteCode,
      timestamp: Date.now()
    };
    
    // Create a simple QR code representation (in real app, use actual QR library)
    const qrText = `Join ${partyName}\nCode: ${inviteCode}\nURL: ${inviteUrl}`;
    const qrDataUrl = `data:text/plain;base64,${btoa(qrText)}`;
    
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code for React Native
 */
export const generateQRCodeNative = async (inviteCode: string, partyName: string): Promise<string> => {
  try {
    // For React Native, we'll use a different approach
    // In a real implementation, you'd use 'react-native-qrcode-svg' or similar
    const inviteUrl = `parlayparty://join/${inviteCode}`;
    const qrData = {
      url: inviteUrl,
      partyName,
      inviteCode,
      timestamp: Date.now()
    };
    
    // Create a simple QR code representation
    const qrText = `Join ${partyName}\nCode: ${inviteCode}\nURL: ${inviteUrl}`;
    const qrDataUrl = `data:text/plain;base64,${Buffer.from(qrText).toString('base64')}`;
    
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// ============================================================================
// MEMBERSHIP VALIDATION
// ============================================================================

/**
 * Check if a party can accept new members
 */
export const canJoinParty = (party: { currentParticipants: number; maxParticipants: number; status: string }): boolean => {
  return (
    party.status === 'active' &&
    party.currentParticipants < party.maxParticipants
  );
};

/**
 * Get remaining slots in a party
 */
export const getRemainingSlots = (party: { currentParticipants: number; maxParticipants: number }): number => {
  return Math.max(0, party.maxParticipants - party.currentParticipants);
};

/**
 * Validate party membership limits
 */
export const validateMembershipLimit = (currentMembers: number, maxMembers: number = 16): boolean => {
  return currentMembers < maxMembers;
};

// ============================================================================
// PARTY DURATION CALCULATION
// ============================================================================

/**
 * Calculate party duration in days
 */
export const calculatePartyDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if party is currently active
 */
export const isPartyActive = (startDate: string, endDate: string): boolean => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return now >= start && now <= end;
};

/**
 * Get party status based on dates
 */
export const getPartyStatus = (startDate: string, endDate: string): 'upcoming' | 'active' | 'ended' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
};

// ============================================================================
// INVITE LINK GENERATION
// ============================================================================

/**
 * Generate invite link for web
 */
export const generateInviteLink = (inviteCode: string, baseUrl?: string): string => {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/join/${inviteCode}`;
};

/**
 * Generate invite link for mobile app
 */
export const generateInviteLinkMobile = (inviteCode: string): string => {
  return `parlayparty://join/${inviteCode}`;
};

// ============================================================================
// PARTY VALIDATION
// ============================================================================

/**
 * Validate party creation data
 */
export const validatePartyCreation = (data: {
  name: string;
  type: 'friendly' | 'competitive';
  startDate: string;
  endDate: string;
  buyIn?: number;
  maxParticipants?: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.name.trim()) {
    errors.push('Party name is required');
  }
  
  if (data.name.length > 50) {
    errors.push('Party name must be 50 characters or less');
  }
  
  if (!data.startDate || !data.endDate) {
    errors.push('Start and end dates are required');
  }
  
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const now = new Date();
    
    if (start < now) {
      errors.push('Start date must be in the future');
    }
    
    if (end <= start) {
      errors.push('End date must be after start date');
    }
    
    const duration = calculatePartyDuration(data.startDate, data.endDate);
    if (duration > 365) {
      errors.push('Party duration cannot exceed 1 year');
    }
  }
  
  if (data.type === 'competitive') {
    if (!data.buyIn || data.buyIn <= 0) {
      errors.push('Buy-in amount is required for competitive parties');
    }
    
    if (data.buyIn && data.buyIn > 1000) {
      errors.push('Buy-in amount cannot exceed $1000');
    }
  }
  
  if (data.maxParticipants && (data.maxParticipants < 2 || data.maxParticipants > 16)) {
    errors.push('Party must have between 2 and 16 participants');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================================================
// MEMBER MANAGEMENT
// ============================================================================

/**
 * Add member to party
 */
export const addMemberToParty = (
  party: { members: any[]; currentParticipants: number; maxParticipants: number },
  newMember: any
): { success: boolean; error?: string } => {
  if (party.currentParticipants >= party.maxParticipants) {
    return { success: false, error: 'Party is full' };
  }
  
  if (party.members.some(member => member.userId === newMember.userId)) {
    return { success: false, error: 'User is already a member' };
  }
  
  return { success: true };
};

/**
 * Remove member from party
 */
export const removeMemberFromParty = (
  party: { members: any[]; createdBy: string },
  memberId: string,
  currentUserId: string
): { success: boolean; error?: string } => {
  if (memberId === party.createdBy) {
    return { success: false, error: 'Cannot remove party creator' };
  }
  
  if (memberId !== currentUserId && party.createdBy !== currentUserId) {
    return { success: false, error: 'Only party creator can remove other members' };
  }
  
  return { success: true };
};
