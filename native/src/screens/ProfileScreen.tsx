import React, { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { Card, Button, Badge } from '@/components/ui';
import { useStore } from '@/store/AppStore';
import * as ImagePicker from 'expo-image-picker';

export const ProfileScreen: React.FC = () => {
  const { 
    user, 
    logout, 
    isAuthenticated, 
    myParties, 
    myPolls, 
    wallet,
    addWalletFunds,
    authLoading,
    updateProfile,
    setProfilePhotoUrl,
    partyScores
  } = useStore();
  
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const handleAddFunds = async (amount: number) => {
    try {
      await addWalletFunds(amount);
      Alert.alert('Success', `Added $${amount} to your wallet!`);
      setShowAddFunds(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add funds');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfilePhotoUrl(imageUri);
        Alert.alert('Success', 'Profile photo updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfilePhotoUrl(imageUri);
        Alert.alert('Success', 'Profile photo updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Update Profile Photo',
      'Choose how you want to update your profile photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
      ]
    );
  };

  const handleEditProfile = () => {
    if (!user) return;
    setEditFullName(user.fullName);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        fullName: editFullName,
        username: editUsername,
        email: editEmail,
      });
      Alert.alert('Success', 'Profile updated successfully!');
      setShowEditProfile(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const avatarUrl = (name: string) => {
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=0E0F13&mouth=smile,smirk&top=shortHair,shortFlat,shortRound&accessories=round&hairColor=2e3442`;
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textMid, fontSize: 16 }}>Please login to view profile</Text>
      </View>
    );
  }

  // Calculate user stats
  const totalParties = myParties.length;
  const activeParties = myParties.filter(p => {
    const endDate = new Date(p.endDate);
    return endDate > new Date();
  }).length;
  
  const totalPolls = myPolls.length;
  const hitPolls = myPolls.filter(p => p.choice === 'hit').length;
  const cashedPolls = myPolls.filter(p => p.status === 'CASH').length;
  const hitRate = totalPolls > 0 ? Math.round((hitPolls / totalPolls) * 100) : 0;
  const cashRate = totalPolls > 0 ? Math.round((cashedPolls / totalPolls) * 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ink }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing(2) }}>
      {/* Profile Header */}
      <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12, marginBottom: spacing(2) }}>
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Pressable onPress={showImagePicker}>
            <Image 
              source={{ uri: user.profilePhotoUrl || avatarUrl(user.fullName) }} 
              style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 16 }} 
            />
            <View style={{
              position: 'absolute',
              bottom: 12,
              right: 0,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: colors.slate
            }}>
              <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>+</Text>
            </View>
          </Pressable>
          
          <Text style={{ color: colors.textHigh, fontSize: 24, fontWeight: '700', marginBottom: 4 }}>
            {user.fullName}
          </Text>
          
          <Text style={{ color: colors.textMid, fontSize: 16, marginBottom: 16 }}>
            @{user.username}
          </Text>

          <View style={{ gap: 8 }}>
            <Badge color={colors.mint}>
              <Text style={{ color: '#000', fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                Points: 167
              </Text>
            </Badge>
            
            <Badge color={colors.gold}>
              <Text style={{ color: '#000', fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                Wallet: ${user.walletBalance.toFixed(2)}
              </Text>
            </Badge>
            
            <Badge color={colors.primary}>
              <Text style={{ color: '#000', fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                Member Since: {new Date().toLocaleDateString()}
              </Text>
            </Badge>
          </View>
        </View>
      </Card>

      {/* Wallet Management */}
      <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12, marginBottom: spacing(2) }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            💰 Wallet Management
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.textMid, fontSize: 16 }}>
              Current Balance: ${wallet.toFixed(2)}
            </Text>
            <Button 
              variant="secondary" 
              onPress={() => setShowAddFunds(!showAddFunds)}
            >
              <Text style={{ fontSize: 12 }}>Add Funds</Text>
            </Button>
          </View>

          {showAddFunds && (
            <View style={{ 
              backgroundColor: colors.chip, 
              padding: 12, 
              borderRadius: 8, 
              borderWidth: 1, 
              borderColor: colors.steel 
            }}>
              <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                Quick Add Funds:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[50, 100, 250, 500].map((amount) => (
                  <Button 
                    key={amount}
                    variant="secondary" 
                    onPress={() => handleAddFunds(amount)}
                    disabled={authLoading}
                  >
                    <Text style={{ fontSize: 12 }}>+${amount}</Text>
                  </Button>
                ))}
              </View>
            </View>
          )}
        </View>
      </Card>

      {/* User Stats */}
      <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12, marginBottom: spacing(2) }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
            📊 Your Stats
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: colors.textHigh, fontSize: 24, fontWeight: '700' }}>
                {totalParties}
              </Text>
              <Text style={{ color: colors.textMid, fontSize: 12 }}>
                Total Parties
              </Text>
            </View>
            
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: colors.textHigh, fontSize: 24, fontWeight: '700' }}>
                {activeParties}
              </Text>
              <Text style={{ color: colors.textMid, fontSize: 12 }}>
                Active Parties
              </Text>
            </View>
            
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: colors.textHigh, fontSize: 24, fontWeight: '700' }}>
                {totalPolls}
              </Text>
              <Text style={{ color: colors.textMid, fontSize: 12 }}>
                Total Polls
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: colors.mint, fontSize: 20, fontWeight: '700' }}>
                {hitRate}%
              </Text>
              <Text style={{ color: colors.textMid, fontSize: 12 }}>
                Hit Rate
              </Text>
            </View>
            
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: colors.gold, fontSize: 20, fontWeight: '700' }}>
                {cashRate}%
              </Text>
              <Text style={{ color: colors.textMid, fontSize: 12 }}>
                Cash Rate
              </Text>
            </View>
            
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700' }}>
                {cashedPolls}
              </Text>
              <Text style={{ color: colors.textMid, fontSize: 12 }}>
                Cashed Out
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Recent Activity */}
      <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12, marginBottom: spacing(2) }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            🎯 Recent Activity
          </Text>
          
          {myPolls.slice(0, 5).map((poll, index) => (
            <View 
              key={poll.id}
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingVertical: 8,
                borderBottomWidth: index < 4 ? 1 : 0,
                borderBottomColor: colors.steel
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600' }}>
                  {poll.pickLabel}
                </Text>
                <Text style={{ color: colors.textLow, fontSize: 12 }}>
                  {poll.partyName}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Badge color={poll.choice === 'hit' ? colors.mint : colors.primary}>
                  <Text style={{ color: '#000', fontSize: 10, fontWeight: '600' }}>
                    {poll.choice.toUpperCase()}
                  </Text>
                </Badge>
                
                <Badge color={
                  poll.status === 'pending' ? colors.warning : 
                  poll.status === 'CASH' ? colors.mint : 
                  colors.error
                }>
                  <Text style={{ color: '#000', fontSize: 10, fontWeight: '600' }}>
                    {poll.status}
                  </Text>
                </Badge>
              </View>
            </View>
          ))}
          
          {myPolls.length === 0 && (
            <Text style={{ color: colors.textMid, fontSize: 14, textAlign: 'center', paddingVertical: 20 }}>
              No activity yet. Start voting on polls!
            </Text>
          )}
        </View>
      </Card>

      {/* Account Actions */}
      <Card style={{ backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1, borderRadius: 12, marginBottom: spacing(2) }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
            ⚙️ Account Actions
          </Text>
          
          <View style={{ gap: 12 }}>
            <Button 
              variant="secondary" 
              onPress={handleEditProfile}
            >
              <Text style={{ fontSize: 14 }}>Edit Profile</Text>
            </Button>
            
            <Button 
              variant="secondary" 
              onPress={() => Alert.alert('Coming Soon', 'Settings will be available soon!')}
            >
              <Text style={{ fontSize: 14 }}>App Settings</Text>
            </Button>
            
            <Button 
              variant="secondary" 
              onPress={() => Alert.alert('Coming Soon', 'Help & support will be available soon!')}
            >
              <Text style={{ fontSize: 14 }}>Help & Support</Text>
            </Button>
            
            <Button 
              variant="primary" 
              onPress={handleLogout}
              style={{ backgroundColor: colors.error }}
            >
              <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>
                Logout
              </Text>
            </Button>
          </View>
        </View>
      </Card>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing(3)
        }}>
          <Card style={{ 
            backgroundColor: colors.slate, 
            borderColor: colors.steel, 
            borderWidth: 1, 
            borderRadius: 12, 
            width: '100%',
            maxWidth: 400
          }}>
            <View style={{ padding: 20 }}>
              <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' }}>
                Edit Profile
              </Text>
              
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ color: colors.textMid, fontSize: 14, marginBottom: 6 }}>Full Name</Text>
                  <TextInput
                    value={editFullName}
                    onChangeText={setEditFullName}
                    style={{
                      color: colors.textHigh,
                      borderColor: colors.steel,
                      borderWidth: 1,
                      borderRadius: 8,
                      padding: 12,
                      backgroundColor: colors.chip,
                      fontSize: 16
                    }}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textLow}
                  />
                </View>
                
                <View>
                  <Text style={{ color: colors.textMid, fontSize: 14, marginBottom: 6 }}>Username</Text>
                  <TextInput
                    value={editUsername}
                    onChangeText={setEditUsername}
                    style={{
                      color: colors.textHigh,
                      borderColor: colors.steel,
                      borderWidth: 1,
                      borderRadius: 8,
                      padding: 12,
                      backgroundColor: colors.chip,
                      fontSize: 16
                    }}
                    placeholder="Enter your username"
                    placeholderTextColor={colors.textLow}
                  />
                </View>
                
                <View>
                  <Text style={{ color: colors.textMid, fontSize: 14, marginBottom: 6 }}>Email</Text>
                  <TextInput
                    value={editEmail}
                    onChangeText={setEditEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{
                      color: colors.textHigh,
                      borderColor: colors.steel,
                      borderWidth: 1,
                      borderRadius: 8,
                      padding: 12,
                      backgroundColor: colors.chip,
                      fontSize: 16
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textLow}
                  />
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <Button 
                  variant="secondary" 
                  onPress={() => setShowEditProfile(false)}
                  style={{ flex: 1 }}
                >
                  <Text style={{ fontSize: 14 }}>Cancel</Text>
                </Button>
                
                <Button 
                  variant="primary" 
                  onPress={handleSaveProfile}
                  disabled={isUpdatingProfile}
                  style={{ flex: 1, opacity: isUpdatingProfile ? 0.5 : 1 }}
                >
                  <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </Text>
                </Button>
              </View>
            </View>
          </Card>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
};
