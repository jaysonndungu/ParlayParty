ParlayParty 🏈⚡
ParlayParty is a social sports betting app designed to make watching sports more engaging with friends. Instead of relying on live data, the app uses a unique AI simulation engine to generate original, play-by-play NFL game narratives. This creates a shared, synchronized experience where everyone in your party follows the same custom game together in real-time.

✨ Key Features
AI-Powered Game Simulation: Generates realistic, play-by-play NFL narratives using GPT-4, complete with dynamic "Clutch Time" moments.

Social Parties: Create or join groups to share parlays, follow a live action feed, and compete on a real-time leaderboard.

Prophet Polls: During clutch moments, vote on whether a player will hit their prop line for bonus points.

Daily Bets: Play the "Pick of the Day" to build a streak or choose to "tail" a friend's parlay once per day.

Live Prop Tracking: Watch player stats for your parlays update live as the simulated game progresses.

🏗️ Architecture & Tech Stack
Frontend: React Native (Expo) for a cross-platform mobile experience, using React Navigation and a custom component library.

Backend: A Node.js and Express.js server handles game logic and API requests.

Database: Supabase (PostgreSQL) for production data and SQLite3 for local development.

AI Integration: The OpenAI API is used for generating game scripts.

Authentication: User management is handled by Supabase Auth with JWTs.

🚀 Getting Started
Prerequisites
Node.js (v18+)

Expo Go app on your phone

Supabase & OpenAI API keys

Installation & Setup
Clone the repo and install dependencies:

git clone <repository-url>
cd ParlayParty
npm install
(cd backend && npm install)
(cd native && npm install)

Set up your environment variables:

# Copy the example and add your API keys
cp .env.example .env

Configure the database by following the SUPABASE_SETUP.md guide.

Run the development servers:

# Terminal 1: Start the backend
cd backend && npm run dev

# Terminal 2: Start the Expo client
cd native && npx expo start --tunnel

Launch the app by scanning the QR code with the Expo Go app on your device.

📁 Project Structure
The repository is organized into three main directories: backend, native (the mobile app), and src (for a future web version).

ParlayParty/
├── backend/         # Node.js/Express backend
├── native/          # React Native mobile app
├── src/             # Web version (Next.js)
└── README.md

🛣️ Roadmap
Integration with live sports data feeds.

Support for more sports (NBA, MLB, etc.).

Expanded social features like chat, reactions, and user profiles.

🤝 Contributing
Pull requests are welcome! Please fork the repository, create a dedicated feature branch for your changes, and submit a PR.

This project is licensed under the MIT License.

Built with ❤️ for sports fans who love the thrill of the game.
