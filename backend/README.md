# ParlayParty Backend API

A Node.js backend API for ParlayParty - Social Sports Betting Platform with AI-powered game simulation.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 📋 API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "fullName": "John Doe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "walletBalance": 1000.00,
    "profilePictureUrl": null
  }
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "walletBalance": 1000.00,
    "profilePictureUrl": null
  }
}
```

#### GET `/api/auth/verify`
Verify if a token is valid.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

#### POST `/api/auth/logout`
Logout (invalidate session).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

### User Management

#### GET `/api/users/profile`
Get current user profile.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

#### PUT `/api/users/profile`
Update user profile.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "fullName": "John Smith",
  "profilePictureUrl": "https://example.com/avatar.jpg",
  "walletBalance": 1500.00
}
```

#### GET `/api/users/parties`
Get user's parties.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

#### POST `/api/users/wallet/add`
Add funds to wallet (demo purposes).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "amount": 500
}
```

## 🧪 Testing the API

### Method 1: Using curl

1. **Register a new user:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "fullName": "Test User",
    "password": "password123"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

3. **Get profile (replace TOKEN with actual token):**
```bash
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer TOKEN"
```

### Method 2: Using Postman

1. Import the following collection:

**Register User:**
- Method: POST
- URL: `http://localhost:3001/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "test@example.com",
  "username": "testuser",
  "fullName": "Test User",
  "password": "password123"
}
```

**Login:**
- Method: POST
- URL: `http://localhost:3001/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Get Profile:**
- Method: GET
- URL: `http://localhost:3001/api/users/profile`
- Headers: `Authorization: Bearer YOUR_TOKEN_HERE`

### Method 3: Using JavaScript (for React Native integration)

```javascript
// Register
const registerUser = async (userData) => {
  const response = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// Login
const loginUser = async (credentials) => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return response.json();
};

// Get profile
const getProfile = async (token) => {
  const response = await fetch('http://localhost:3001/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_PATH=./database/parlayparty.db
CORS_ORIGIN=http://localhost:8081,exp://10.90.171.235:8081
```

## 📊 Database

The API uses SQLite for simplicity. The database file will be created automatically at `./database/parlayparty.db`.

### Tables Created:
- `users` - User accounts and profiles
- `parties` - Social groups
- `party_members` - Party membership
- `user_sessions` - JWT token management
- `games` - Future game simulation data
- `game_events` - Future AI-generated events

## 🔮 Future Features

- AI-powered game simulation integration
- Real-time WebSocket updates
- Party management endpoints
- Parlay betting system
- Live scoring and leaderboards

## 🛠️ Development

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (coming soon)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Input validation with Joi
- SQL injection protection
