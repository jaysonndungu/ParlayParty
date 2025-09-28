// API Configuration - Using your computer's local IP
const API_BASE_URL = 'http://10.90.171.235:3001/api';

// Authentication API calls
export const authAPI = {
  // Register a new user
  register: async (userData: {
    email: string;
    username: string;
    fullName: string;
    password: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },

  // Login user
  login: async (credentials: {
    email: string;
    password: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  // Get user profile
  getProfile: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }

    return response.json();
  },

  // Update user profile
  updateProfile: async (token: string, updates: {
    fullName?: string;
    profilePictureUrl?: string;
    walletBalance?: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    return response.json();
  },

  // Add wallet funds (for testing)
  addWalletFunds: async (token: string, amount: number) => {
    const response = await fetch(`${API_BASE_URL}/users/wallet/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add funds');
    }

    return response.json();
  },

  // Verify token
  verifyToken: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Token verification failed');
    }

    return response.json();
  },
};
