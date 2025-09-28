import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { Button, Card } from '@/components/ui';
import { useStore } from '@/store/AppStore';

export const AuthScreen: React.FC = () => {
  const { register, login, authLoading, authError, isAuthenticated, user } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: '',
  });

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
        Alert.alert('Success', 'Logged in successfully!');
      } else {
        await register({
          email: formData.email,
          username: formData.username,
          fullName: formData.fullName,
          password: formData.password,
        });
        Alert.alert('Success', 'Account created successfully!');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      fullName: '',
      password: '',
    });
  };

  if (isAuthenticated && user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink, padding: spacing(2), justifyContent: 'center' }}>
        <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12 }}>
          <View style={{ padding: 16 }}>
            <Text style={{ color: colors.textHigh, fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center' }}>
              🎉 Welcome Back!
            </Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                {user.fullName}
              </Text>
              <Text style={{ color: colors.textMid, fontSize: 14, marginBottom: 4 }}>
                @{user.username}
              </Text>
              <Text style={{ color: colors.textMid, fontSize: 14, marginBottom: 4 }}>
                {user.email}
              </Text>
              <Text style={{ color: colors.textMid, fontSize: 14 }}>
                Wallet: ${user.walletBalance.toFixed(2)}
              </Text>
            </View>

            <Button 
              variant="primary" 
              onPress={() => {
                // This would navigate to the main app
                Alert.alert('Info', 'Ready to use the app! Backend authentication is working.');
              }}
            >
              <Text style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>Continue to App</Text>
            </Button>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ink }}>
      <View style={{ flex: 1, padding: spacing(2), justifyContent: 'center' }}>
      <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12 }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.textHigh, fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
            ParlayParty
          </Text>
          <Text style={{ color: colors.textMid, fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </Text>

          {authError && (
            <View style={{ 
              backgroundColor: colors.error, 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 16 
            }}>
              <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>
                {authError}
              </Text>
            </View>
          )}

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Email
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.chip,
                borderWidth: 1,
                borderColor: colors.steel,
                borderRadius: 8,
                padding: 12,
                color: colors.textHigh,
                fontSize: 16,
              }}
              placeholder="Enter your email"
              placeholderTextColor={colors.textLow}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {!isLogin && (
            <>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Username
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.chip,
                    borderWidth: 1,
                    borderColor: colors.steel,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.textHigh,
                    fontSize: 16,
                  }}
                  placeholder="Choose a username"
                  placeholderTextColor={colors.textLow}
                  value={formData.username}
                  onChangeText={(text) => setFormData({ ...formData, username: text })}
                  autoCapitalize="none"
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  Full Name
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.chip,
                    borderWidth: 1,
                    borderColor: colors.steel,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.textHigh,
                    fontSize: 16,
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textLow}
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                />
              </View>
            </>
          )}

          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Password
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.chip,
                borderWidth: 1,
                borderColor: colors.steel,
                borderRadius: 8,
                padding: 12,
                color: colors.textHigh,
                fontSize: 16,
              }}
              placeholder="Enter your password"
              placeholderTextColor={colors.textLow}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
          </View>

          <Button 
            variant="primary" 
            onPress={handleSubmit}
            disabled={authLoading}
          >
            <Text style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>
              {authLoading ? 'Loading...' : (isLogin ? 'Login' : 'Create Account')}
            </Text>
          </Button>

          <Pressable 
            onPress={() => {
              setIsLogin(!isLogin);
              resetForm();
            }}
            style={{ marginTop: 16, alignItems: 'center' }}
          >
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </Text>
          </Pressable>
        </View>
      </Card>
      </View>
    </SafeAreaView>
  );
};
