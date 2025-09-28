# ParlayParty Parties API Documentation

This directory contains the API contracts and client for the ParlayParty parties functionality. The API enables users to create, join, and manage social betting parties.

## 📁 Files

- `parties.ts` - TypeScript types, interfaces, and API contracts
- `parties-client.ts` - API client with easy-to-use functions
- `README.md` - This documentation file

## 🚀 Quick Start

### 1. Import the API Client

```typescript
import { createPartiesApiClient, partiesApi } from '@/lib/api/parties-client';

// Use the default client (configured via environment variables)
const response = await partiesApi.createParty({
  name: "My Party",
  type: "friendly",
  startDate: "2024-01-15",
  endDate: "2024-01-22"
});

// Or create a custom client
const customClient = createPartiesApiClient({
  baseUrl: 'https://api.parlayparty.com',
  apiKey: 'your-api-key',
  timeout: 15000
});
```

### 2. Using React Hooks

```typescript
import { usePartiesApi } from '@/lib/api/parties-react-hooks';

function MyComponent() {
  const { loading, error, execute } = usePartiesApi();
  
  const handleCreateParty = async () => {
    const result = await execute(client => 
      client.createParty({
        name: "Sunday Funday",
        type: "friendly",
        startDate: "2024-01-14",
        endDate: "2024-01-21"
      })
    );
    
    if (result?.success) {
      console.log('Party created:', result.data?.party);
    }
  };
  
  return (
    <button onClick={handleCreateParty} disabled={loading}>
      {loading ? 'Creating...' : 'Create Party'}
    </button>
  );
}
```

## 📋 API Endpoints

### Party Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/parties` | Create a new party |
| `GET` | `/api/parties/:partyId` | Get party details |
| `PUT` | `/api/parties/:partyId` | Update party (creator only) |
| `DELETE` | `/api/parties/:partyId` | Delete party (creator only) |

### Party Discovery

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/parties` | List all parties with filters |
| `GET` | `/api/parties/my` | List user's parties |
| `GET` | `/api/parties/search` | Search parties by query |

### Party Membership

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/parties/join` | Join a party with code |
| `POST` | `/api/parties/:partyId/leave` | Leave a party |
| `POST` | `/api/parties/:partyId/kick` | Kick member (creator only) |
| `GET` | `/api/parties/:partyId/members` | List party members |

### Party Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/parties/:partyId/stats` | Get party statistics |
| `GET` | `/api/parties/:partyId/leaderboard` | Get leaderboard |

## 🎯 Core Concepts

### Party Types

#### Friendly Parties
- No monetary stakes
- Focus on social competition
- Free to join
- Perfect for casual betting with friends

#### Competitive Parties
- Real money buy-ins
- Prize pools distributed to winners
- Stricter rules and validation
- Professional-grade competition

### Party Lifecycle

1. **Created** - Party is created by a user
2. **Active** - Party is accepting members and bets
3. **Paused** - Party temporarily suspended
4. **Completed** - Party has ended, winners determined
5. **Cancelled** - Party was cancelled before completion

## 💡 Usage Examples

### Creating a Friendly Party

```typescript
const friendlyParty = await partiesApi.createParty({
  name: "Sunday Funday NFL Party",
  type: "friendly",
  startDate: "2024-01-14",
  endDate: "2024-01-21",
  description: "Weekly NFL parlay competition with friends",
  tags: ["NFL", "Sunday", "Friends"],
  isPrivate: false
});

if (friendlyParty.success) {
  console.log('Join code:', friendlyParty.data?.joinCode);
  console.log('Party ID:', friendlyParty.data?.party.id);
}
```

### Creating a Competitive Party

```typescript
const competitiveParty = await partiesApi.createParty({
  name: "High Stakes NBA Championship",
  type: "competitive",
  startDate: "2024-01-15",
  endDate: "2024-06-15",
  description: "NBA playoffs parlay competition",
  buyIn: 50.00,
  allowedSports: ["NBA"],
  maxParticipants: 20,
  evaluationLimit: 10,
  evaluationPeriod: "weekly"
});
```

### Joining a Party

```typescript
const joinResult = await partiesApi.joinParty({
  joinCode: "ABC123",
  buyIn: 50.00 // Required for competitive parties
});

if (joinResult.success) {
  console.log('Successfully joined party:', joinResult.data?.party.name);
}
```

### Listing and Filtering Parties

```typescript
// List all active competitive parties
const competitiveParties = await partiesApi.listParties({
  type: "competitive",
  status: "active",
  limit: 10,
  sortBy: "prizePool",
  sortOrder: "desc"
});

// Search for NFL parties
const nflParties = await partiesApi.searchParties("NFL", {
  type: "friendly",
  status: "active"
});

// Get user's parties
const myParties = await partiesApi.listMyParties({
  status: "active"
});
```

### Getting Party Details

```typescript
// Get basic party info
const party = await partiesApi.getParty("party-id-123");

// Get party with members and stats
const detailedParty = await partiesApi.getParty("party-id-123", true, true);

if (detailedParty.success) {
  console.log('Party:', detailedParty.data?.party);
  console.log('Members:', detailedParty.data?.members);
  console.log('Stats:', detailedParty.data?.stats);
}
```

## 🔧 Error Handling

The API client provides comprehensive error handling:

```typescript
import { ApiError, isApiError, getErrorMessage } from '@/lib/api/parties-client';

try {
  const result = await partiesApi.createParty(partyData);
} catch (error) {
  if (isApiError(error, 'INSUFFICIENT_FUNDS')) {
    console.log('Not enough money in wallet');
  } else if (isApiError(error, 'INVALID_DATES')) {
    console.log('Invalid date range provided');
  } else {
    console.log('Error:', getErrorMessage(error));
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INSUFFICIENT_FUNDS` | Not enough money for buy-in |
| `INVALID_DATES` | Invalid start/end date range |
| `PARTY_FULL` | Party has reached max participants |
| `INVALID_JOIN_CODE` | Join code doesn't exist or expired |
| `ALREADY_MEMBER` | User is already a member of the party |
| `NOT_PARTY_CREATOR` | User is not the party creator |

## 🎨 UI Integration

### Using with React State

```typescript
import { useState, useEffect } from 'react';
import { usePartiesApi } from '@/lib/api/parties-react-hooks';

function PartiesList() {
  const { loading, error, execute } = usePartiesApi();
  const [parties, setParties] = useState([]);
  
  useEffect(() => {
    const loadParties = async () => {
      const result = await execute(client => 
        client.listParties({ status: 'active' })
      );
      
      if (result?.success) {
        setParties(result.data?.parties || []);
      }
    };
    
    loadParties();
  }, [execute]);
  
  if (loading) return <div>Loading parties...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {parties.map(party => (
        <div key={party.id}>
          <h3>{party.name}</h3>
          <p>{party.type} • {party.currentParticipants} members</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔒 Security Considerations

- All API requests require authentication via API key
- Party creators have full control over their parties
- Buy-ins are validated before allowing joins
- Join codes are time-limited and single-use
- Sensitive operations (delete, kick) require creator permissions

## 📊 Validation Rules

### Party Creation
- Name: 1-100 characters, alphanumeric + spaces/hyphens/underscores
- Dates: Start date must be today or later, end date must be after start date
- Duration: Maximum 1 year
- Buy-in: $0.01 - $10,000 for competitive parties
- Max participants: 2-100 people

### Party Joining
- Join code: 6-12 characters, uppercase alphanumeric
- Buy-in must match party requirements for competitive parties
- User must have sufficient funds

## 🚀 Next Steps

1. **Backend Implementation**: Use these contracts to build your API endpoints
2. **Database Schema**: Design tables based on the Party and PartyMember types
3. **Authentication**: Integrate with your user authentication system
4. **Real-time Updates**: Add WebSocket support for live party updates
5. **Payment Processing**: Integrate with Stripe or similar for buy-ins
6. **Game Simulation**: Build the core game simulation engine mentioned in context.txt

## 🤝 Contributing

When adding new features or modifying existing contracts:

1. Update the types in `parties.ts`
2. Add corresponding client methods in `parties-client.ts`
3. Update this documentation
4. Add comprehensive tests
5. Consider backward compatibility

## 📞 Support

For questions or issues with the API contracts:

1. Check the error codes and validation rules
2. Review the example usage patterns
3. Test with the provided React hooks
4. Consult the TypeScript types for required fields
