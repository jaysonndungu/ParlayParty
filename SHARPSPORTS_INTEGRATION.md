# SharpSports API Integration

This document explains how to set up and use the SharpSports API integration for PrizePicks data in your ParlayParty app.

## Setup Instructions

### 1. Backend Configuration

1. **Install Dependencies**
   ```bash
   cd backend
   npm install axios
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory with the following variables:
   ```env
   # SharpSports API Configuration
   SHARPSPORTS_API_URL=https://api.sharpsports.io/v1
   SHARPSPORTS_API_KEY=your-sharpsports-api-key-here
   SHARPSPORTS_CLIENT_ID=your-sharpsports-client-id-here
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

### 2. Frontend Configuration

1. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

2. **Start the Frontend**
   ```bash
   npm run dev
   ```

## Features

### PrizePicks Integration in Parties Tab

The integration adds a new PrizePicks card to the top of the Parties tab that displays:

- **Account Connection**: Secure OAuth flow to connect PrizePicks accounts
- **Balance Information**: Current account balance and total wagered
- **Performance Stats**: Win rate, current streak, and betting statistics
- **Recent Bets**: Last 5 bets with status and details
- **Quick Actions**: Links to open PrizePicks and refresh data

### API Endpoints

The backend provides the following endpoints:

- `POST /api/sharpsports/link/initialize` - Initialize account linking
- `GET /api/sharpsports/betslips` - Get user's bet slips
- `GET /api/sharpsports/account` - Get account information
- `POST /api/sharpsports/account/refresh` - Refresh account data
- `GET /api/sharpsports/stats` - Get aggregated stats for UI
- `POST /api/sharpsports/webhook` - Handle webhook events

### Sandbox Mode

When `NODE_ENV` is not set to `production`, the integration runs in sandbox mode with:
- Mock data for testing
- Simulated API responses
- No real PrizePicks connections required

## Usage

1. **Navigate to Parties Tab**: Click on the "Parties" tab in the bottom navigation
2. **Connect PrizePicks**: Click "Connect PrizePicks" in the PrizePicks card
3. **Authorize Connection**: Complete the OAuth flow in the popup window
4. **View Stats**: See your PrizePicks data integrated into the parties interface

## Security

- All API calls require authentication tokens
- OAuth flow uses secure popup windows
- Webhook signatures are verified in production
- CORS is properly configured for frontend access

## Development Notes

- The integration uses mock data in development mode
- Real SharpSports API credentials are required for production
- The OAuth callback page handles the authorization flow
- WebSocket support is ready for real-time updates

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the frontend URL is added to backend CORS configuration
2. **Authentication Errors**: Check that the auth token is properly set
3. **API Connection Issues**: Verify SharpSports API credentials and network connectivity

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed API request/response logs in the console.
