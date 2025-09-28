import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { colors } from '@/theme/tokens';
import { Button, Card } from '@/components/ui';
import { useStore } from '@/store/AppStore';

export const BackendTestComponent: React.FC = () => {
  const { register, login, authLoading, authError, isAuthenticated, user, logout, addWalletFunds } = useStore();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testRegistration = async () => {
    try {
      const testUser = {
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        fullName: 'Test User',
        password: 'password123',
      };
      
      await register(testUser);
      addResult('✅ Registration successful');
    } catch (error) {
      addResult(`❌ Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testLogin = async () => {
    try {
      await login({
        email: 'test@example.com',
        password: 'password123',
      });
      addResult('✅ Login successful');
    } catch (error) {
      addResult(`❌ Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testLogout = () => {
    logout();
    addResult('✅ Logout successful');
  };

  const testAddFunds = async () => {
    try {
      await addWalletFunds(100);
      addResult('✅ Added $100 to wallet');
    } catch (error) {
      addResult(`❌ Add funds failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12, margin: 16 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
          🔧 Backend Test Panel
        </Text>
        
        <Text style={{ color: colors.textMid, fontSize: 14, marginBottom: 16 }}>
          Status: {isAuthenticated ? `✅ Logged in as ${user?.username}` : '❌ Not authenticated'}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Button variant="secondary" onPress={testRegistration} disabled={authLoading}>
            <Text style={{ fontSize: 12 }}>Test Register</Text>
          </Button>
          
          <Button variant="secondary" onPress={testLogin} disabled={authLoading}>
            <Text style={{ fontSize: 12 }}>Test Login</Text>
          </Button>
          
          {isAuthenticated && (
            <>
              <Button variant="secondary" onPress={testAddFunds} disabled={authLoading}>
                <Text style={{ fontSize: 12 }}>Add $100</Text>
              </Button>
              <Button variant="secondary" onPress={testLogout}>
                <Text style={{ fontSize: 12 }}>Logout</Text>
              </Button>
            </>
          )}
          
          <Button variant="secondary" onPress={clearResults}>
            <Text style={{ fontSize: 12 }}>Clear</Text>
          </Button>
        </View>

        {authError && (
          <View style={{ 
            backgroundColor: colors.error, 
            padding: 8, 
            borderRadius: 6, 
            marginBottom: 12 
          }}>
            <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>
              Error: {authError}
            </Text>
          </View>
        )}

        <View style={{ 
          backgroundColor: colors.chip, 
          padding: 12, 
          borderRadius: 8, 
          maxHeight: 200 
        }}>
          <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
            Test Results:
          </Text>
          {testResults.length === 0 ? (
            <Text style={{ color: colors.textLow, fontSize: 12 }}>
              No tests run yet. Tap a button above to test the backend.
            </Text>
          ) : (
            testResults.map((result, index) => (
              <Text key={index} style={{ color: colors.textMid, fontSize: 11, marginBottom: 2 }}>
                {result}
              </Text>
            ))
          )}
        </View>
      </View>
    </Card>
  );
};
