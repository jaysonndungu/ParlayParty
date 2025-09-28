const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  username: 'testuser',
  fullName: 'Test User'
};

const testParty = {
  name: 'Test Party',
  type: 'friendly',
  startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
  buyIn: 0,
  allowedSports: ['NFL', 'NBA'],
  description: 'Test party for API testing',
  isPrivate: false
};

let authToken = '';
let createdPartyId = '';
let joinCode = '';

async function testAPI() {
  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Register user
    console.log('1️⃣ Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data);
    authToken = registerResponse.data.token;

    // Test 2: Login user
    console.log('\n2️⃣ Testing user login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data);
    authToken = loginResponse.data.token;

    // Test 3: Create party
    console.log('\n3️⃣ Testing party creation...');
    const createPartyResponse = await axios.post(`${API_BASE_URL}/parties`, testParty, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Party creation successful:', createPartyResponse.data);
    createdPartyId = createPartyResponse.data.data.party.id;
    joinCode = createPartyResponse.data.data.joinCode;

    // Test 4: Get user's parties
    console.log('\n4️⃣ Testing get user parties...');
    const getPartiesResponse = await axios.get(`${API_BASE_URL}/parties/my-parties`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get parties successful:', getPartiesResponse.data);

    // Test 5: Join party (create second user)
    console.log('\n5️⃣ Testing party joining...');
    const secondUser = {
      email: 'test2@example.com',
      password: 'password123',
      username: 'testuser2',
      fullName: 'Test User 2'
    };

    // Register second user
    await axios.post(`${API_BASE_URL}/auth/register`, secondUser);
    const secondUserLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: secondUser.email,
      password: secondUser.password
    });
    const secondUserToken = secondUserLogin.data.token;

    // Join party
    const joinResponse = await axios.post(`${API_BASE_URL}/parties/join`, {
      joinCode: joinCode,
      username: secondUser.username,
      displayName: secondUser.fullName
    }, {
      headers: { Authorization: `Bearer ${secondUserToken}` }
    });
    console.log('✅ Join party successful:', joinResponse.data);

    console.log('\n🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testAPI();
