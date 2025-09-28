#!/bin/bash

echo "🚀 Starting ParlayParty Mobile Testing Setup"
echo "============================================="

# Find IP address
echo "📡 Finding your computer's IP address..."
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "Your IP address: $IP"

# Update the mobile service file
echo "🔧 Updating mobile app configuration..."
sed -i '' "s/http:\/\/10\.90\.171\.235:3001\/api/http:\/\/$IP:3001\/api/g" native/src/services/sharpsports.ts
echo "✅ Updated mobile app to use IP: $IP"

echo ""
echo "📋 Next Steps:"
echo "1. Start the backend: cd backend && npm run dev"
echo "2. Start Expo: cd native && npm start"
echo "3. Scan QR code with Expo Go app on your phone"
echo ""
echo "🔗 Test the backend API: http://$IP:3001/api/sharpsports/demo"
echo ""
echo "Make sure your phone and computer are on the same WiFi network!"
