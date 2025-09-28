#!/bin/bash

echo "🔍 Finding your computer's IP address..."
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "Your IP address: $IP"

echo ""
echo "🧪 Testing backend connection..."
curl -s "http://$IP:3001/api/sharpsports/demo" | head -200

echo ""
echo "📱 To test on your phone:"
echo "1. Make sure backend is running: cd backend && npm run dev"
echo "2. Update mobile app IP: Edit native/src/services/sharpsports.ts"
echo "3. Change line 73 to: this.baseURL = 'http://$IP:3001/api';"
echo "4. Start Expo: cd native && npm start"
echo "5. Scan QR code with Expo Go app"
echo ""
echo "Make sure your phone and computer are on the same WiFi!"
