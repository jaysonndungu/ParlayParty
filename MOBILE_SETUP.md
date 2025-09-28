# Mobile Testing Setup for Expo Go

## Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm install axios  # Install the new dependency if you haven't already
npm run dev
```
This will start the backend on `http://localhost:3001`

### 2. Find Your Computer's IP Address
Run this command to find your IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
```

Or on Windows:
```cmd
ipconfig | findstr "IPv4"
```

### 3. Update the Mobile App IP Address
Edit `/native/src/services/sharpsports.ts` and replace the IP address in line 24:
```typescript
this.baseURL = 'http://YOUR_IP_HERE:3001/api';
```

For example, if your IP is `192.168.1.100`, change it to:
```typescript
this.baseURL = 'http://192.168.1.100:3001/api';
```

### 4. Start the Expo App
```bash
cd native
npm start
```

### 5. Scan QR Code with Expo Go
- Install Expo Go app on your phone from App Store/Google Play
- Scan the QR code that appears in your terminal
- Make sure your phone and computer are on the same WiFi network

## What You'll See

1. **Parties Tab**: The PrizePicks integration card will appear at the top
2. **Connect Button**: Tap "Connect PrizePicks" to test the connection flow
3. **Demo Data**: You'll see mock PrizePicks stats including:
   - Account balance: $245.50
   - Win streak: 3
   - Win rate: 62%
   - Total wagered: $1,251
   - Recent bets with status indicators

## Troubleshooting

### Can't Connect to Backend
- Make sure both devices are on the same WiFi
- Check that the IP address is correct
- Verify the backend is running on port 3001
- Try disabling firewall temporarily

### Expo Go Issues
- Make sure you're using the latest Expo Go app
- Try restarting the Expo development server
- Clear Expo Go cache if needed

### API Errors
- Check the backend console for error messages
- Verify the demo endpoint works: `http://YOUR_IP:3001/api/sharpsports/demo`

## Testing the Integration

1. **View Demo Data**: The app will show mock PrizePicks stats
2. **Test Connection Flow**: Tap "Connect PrizePicks" to see the OAuth flow
3. **Refresh Data**: Tap the refresh button to reload stats
4. **Open PrizePicks**: Tap "Open PrizePicks" to launch the website

The integration is fully functional with demo data, so you can see exactly how it will work with real PrizePicks accounts!
