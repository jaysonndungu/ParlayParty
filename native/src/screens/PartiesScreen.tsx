import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Pressable, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { Card, Button, Badge } from '@/components/ui';
import { useStore } from '@/store/AppStore';
import { DateRangePicker, validateDateRange } from '@/components/DatePicker';

export const PartiesScreen: React.FC = () => {
  const { 
    myParties, 
    selectedPartyId, 
    selectParty, 
    createParty, 
    joinParty,
    deleteParty,
    wallet,
    addFunds,
    withdrawFunds,
    user
  } = useStore();
  
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [type, setType] = useState<'friendly' | 'competitive'>('friendly');
  const [code, setCode] = useState('');
  const [joinBuyIn, setJoinBuyIn] = useState<string>('');
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyType, setNewPartyType] = useState<'friendly' | 'competitive'>('friendly');
  const [newPartyStart, setNewPartyStart] = useState('');
  const [newPartyEnd, setNewPartyEnd] = useState('');
  const [newBuyIn, setNewBuyIn] = useState<string>('');
  // Removed sports selector - using default sports
  const [newEvalLimit, setNewEvalLimit] = useState<string>('5');
  const [addFundsAmt, setAddFundsAmt] = useState<string>('');
  const [withdrawAmt, setWithdrawAmt] = useState<string>('');
  const [walletError, setWalletError] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');
  const [createError, setCreateError] = useState<string>('');
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [createdParty, setCreatedParty] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [buyInConfirmed, setBuyInConfirmed] = useState<boolean>(false);
  const [tempBuyIn, setTempBuyIn] = useState<string>('');

  // Removed sports selector - using default sports

  const formatDate = (date: Date) => {
    return date.toISOString().slice(0, 10);
  };

  const getToday = () => formatDate(new Date());
  const getNextWeek = () => formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  const handleBuyInConfirm = () => {
    const amount = parseFloat(tempBuyIn);
    if (amount && amount > 0) {
      setNewBuyIn(tempBuyIn);
      setBuyInConfirmed(true);
    }
  };

  const handleBuyInChange = (value: string) => {
    setTempBuyIn(value);
    setBuyInConfirmed(false);
  };

  const handleCreateParty = async () => {
    setDateError('');
    setCreateError('');
    
    // Use the new date validation
    const dateValidation = validateDateRange(newPartyStart, newPartyEnd);
    if (!dateValidation.isValid) {
      setDateError(dateValidation.errors.join(', '));
      return;
    }

    if (newPartyType === 'competitive') {
      if (!buyInConfirmed) {
        setCreateError('Please confirm your buy-in amount');
        return;
      }
      const buyIn = parseFloat(newBuyIn);
      if (!buyIn || buyIn <= 0) {
        setCreateError('Enter a valid buy-in amount');
        return;
      }
      // Using default sports - no validation needed
      if (wallet < buyIn) {
        setCreateError('Insufficient funds in wallet for buy-in');
        return;
      }
    }

    try {
      const result = await createParty(
        newPartyName,
        newPartyType,
        newPartyStart,
        newPartyEnd,
        newPartyType === 'competitive' ? parseFloat(newBuyIn) : undefined,
        ['NFL', 'NBA'], // Default sports
        parseInt(newEvalLimit)
      );
      
      if (result) {
        // Use the actual joinCode from the API
        setInviteCode(result.joinCode);
        setCreatedParty({
          name: newPartyName.trim() || (newPartyType === 'friendly' ? 'Friendly Party' : 'Competitive Party'),
          type: newPartyType,
          joinCode: result.joinCode,
          maxParticipants: 16,
          currentParticipants: 1
        });
        setShowInviteCode(true);
      } else {
        setCreateError('Failed to create party');
      }
    } catch (error) {
      setCreateError('Failed to create party');
    }
    
    setOpen(false);
    setNewPartyName('');
    setNewPartyType('friendly');
    setNewPartyStart('');
    setNewPartyEnd('');
    setNewBuyIn('');
    // Removed sports selector
    setNewEvalLimit('5');
    setBuyInConfirmed(false);
    setTempBuyIn('');
  };

  const handleJoinParty = () => {
    setDateError('');
    
    // Check if it's a competitive party (starts with 'C')
    const isCompetitive = code.trim().toUpperCase().startsWith('C');
    
    if (isCompetitive) {
      const buyIn = parseFloat(joinBuyIn);
      
      // Validate buy-in amount
      if (!joinBuyIn.trim() || isNaN(buyIn) || buyIn <= 0) {
        setDateError('Enter a valid buy-in amount to join this competitive party');
        return;
      }
      
      // Check wallet balance
      if (wallet < buyIn) {
        setDateError(`Insufficient wallet funds. You need $${buyIn} but only have $${wallet.toFixed(2)}`);
        return;
      }
      
      // For competitive parties, require buy-in
      joinParty(code, buyIn);
    } else {
      // For friendly parties, no buy-in required
      joinParty(code);
    }
    
    setOpen(false);
    setCode('');
    setJoinBuyIn('');
  };

  const handleAddFunds = () => {
    setWalletError('');
    const amt = parseFloat(addFundsAmt);
    if (isNaN(amt) || amt <= 0) {
      setWalletError('Enter a valid amount');
      return;
    }
    addFunds(amt);
    setAddFundsAmt('');
  };

  const handleWithdraw = () => {
    setWalletError('');
    const amt = parseFloat(withdrawAmt);
    if (isNaN(amt) || amt <= 0) {
      setWalletError('Enter a valid amount');
      return;
    }
    if (amt > wallet) {
      setWalletError('Insufficient balance');
      return;
    }
    withdrawFunds(amt);
    setWithdrawAmt('');
  };

  // Removed sports selector

  const handleDeleteParty = async (partyId: string, partyName: string) => {
    console.log('Delete party requested:', { partyId, partyName, userId: user?.id });
    Alert.alert(
      'Delete Party',
      `Are you sure you want to delete "${partyName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteParty(partyId);
              Alert.alert('Success', 'Party deleted successfully');
            } catch (error) {
              console.error('Delete party error:', error);
              Alert.alert('Error', 'Failed to delete party');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ink }}>
      <View style={{ flex: 1, padding: spacing(2) }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(2) }}>
        <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '700' }}>Your Parties</Text>
        <Button variant='primary' onPress={() => setOpen(true)}>
          <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>Create / Join</Text>
        </Button>
      </View>

      {/* Wallet */}
      <Card style={{ marginBottom: spacing(2), backgroundColor: colors.slate, borderColor: colors.steel, borderWidth: 1 }}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.textHigh, fontSize: 16, fontWeight: '700' }}>Wallet</Text>
            <Badge color={colors.gold}>${wallet.toFixed(2)}</Badge>
          </View>
          
          {walletError && (
            <Text style={{ color: colors.error, fontSize: 12, marginBottom: 8 }}>{walletError}</Text>
          )}
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMid, fontSize: 12, marginBottom: 4 }}>Add funds</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TextInput
                  placeholder="Amount"
                  placeholderTextColor={colors.textLow}
                  value={addFundsAmt}
                  onChangeText={setAddFundsAmt}
                  keyboardType="numeric"
                  style={{ 
                    flex: 1, 
                    color: colors.textHigh, 
                    borderWidth: 1, 
                    borderColor: colors.steel, 
                    borderRadius: 8, 
                    padding: 8,
                    backgroundColor: colors.chip
                  }}
                />
                <Button variant="primary" onPress={handleAddFunds}>
                  <Text style={{ color: '#000', fontSize: 10, fontWeight: '600' }}>Add</Text>
                </Button>
              </View>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textMid, fontSize: 12, marginBottom: 4 }}>Withdraw</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TextInput
                  placeholder="Amount"
                  placeholderTextColor={colors.textLow}
                  value={withdrawAmt}
                  onChangeText={setWithdrawAmt}
                  keyboardType="numeric"
                  style={{ 
                    flex: 1, 
                    color: colors.textHigh, 
                    borderWidth: 1, 
                    borderColor: colors.steel, 
                    borderRadius: 8, 
                    padding: 8,
                    backgroundColor: colors.chip
                  }}
                />
                <Button variant="secondary" onPress={handleWithdraw}>
                  <Text style={{ fontSize: 10, fontWeight: '600' }}>Withdraw</Text>
                </Button>
              </View>
            </View>
          </View>
          
          <Text style={{ color: colors.textLow, fontSize: 10, marginTop: 8 }}>Demo wallet. No real payments are processed.</Text>
        </View>
      </Card>

      {/* Parties List */}
      <FlatList
        data={myParties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const s = new Date(item.startDate).getTime();
          const e = new Date(item.endDate).getTime();
          const n = Date.now();
          const total = Math.max(1, e - s);
          const pct = Math.max(0, Math.min(100, ((n - s) / total) * 100));
          
          let status: string;
          if (isNaN(s) || isNaN(e)) {
            status = "Dates unavailable";
          } else if (n < s) {
            const diff = s - n;
            const d = Math.floor(diff / (24*3600_000));
            const h = Math.floor((diff % (24*3600_000)) / 3600_000);
            status = `Starts in ${d}d ${String(h).padStart(2,'0')}h`;
          } else if (n > e) {
            status = "Ended";
          } else {
            const diff = e - n;
            const d = Math.floor(diff / (24*3600_000));
            const h = Math.floor((diff % (24*3600_000)) / 3600_000);
            status = `${d}d ${String(h).padStart(2,'0')}h left`;
          }

          return (
            <Card style={{ 
              marginBottom: 10, 
              borderColor: item.id === selectedPartyId ? colors.primary : colors.steel, 
              borderWidth: item.id === selectedPartyId ? 2 : 1,
              backgroundColor: colors.slate
            }}>
              <View style={{ padding: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Pressable
                      onLongPress={() => {
                        // Show delete option for party creator on long press
                        if (user && item.createdBy === user.id) {
                          handleDeleteParty(item.id, item.name);
                        }
                      }}
                    >
                      <Text style={{ color: colors.textHigh, fontWeight: '700', fontSize: 16 }}>{item.name}</Text>
                    </Pressable>
                    <Text style={{ color: colors.textMid, marginTop: 2, textTransform: 'capitalize' }}>{item.type}</Text>
                    {item.joinCode && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                        <Text style={{ color: colors.textLow, fontSize: 12 }}>Join Code:</Text>
                        <View style={{ backgroundColor: colors.chip, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ color: colors.textHigh, fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>
                            {item.joinCode}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    {item.id === selectedPartyId && (
                      <Badge color={colors.primary}>Selected</Badge>
                    )}
                    {item.type === 'competitive' && (
                      <Badge color={colors.gold}>Pool $0</Badge>
                    )}
                  </View>
                </View>
                
                {/* Progress Bar */}
                <View style={{ marginBottom: 8 }}>
                  <View style={{ 
                    height: 8, 
                    backgroundColor: colors.steel, 
                    borderRadius: 4, 
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <View style={{ 
                      height: '100%', 
                      backgroundColor: colors.gold, 
                      width: `${pct}%` 
                    }} />
                    <View style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: `${pct}%`, 
                      transform: [{ translateX: -6 }, { translateY: -6 }],
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: colors.primary,
                      borderWidth: 2,
                      borderColor: colors.slate
                    }} />
                  </View>
                  <Text style={{ color: colors.textMid, fontSize: 10, marginTop: 4, textAlign: 'center' }}>{status}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge color={colors.chip}>{item.type}</Badge>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button 
                      onPress={() => {
                        selectParty(item.id);
                        // Navigate to chat tab - this would need to be handled by parent component
                        // For now, we'll just select the party and user can manually go to chat
                      }}
                      variant="secondary"
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600' }}>💬 Chat</Text>
                    </Button>
                    <Button 
                      onPress={() => selectParty(item.id)} 
                      disabled={item.id === selectedPartyId}
                      variant={item.id === selectedPartyId ? "secondary" : "primary"}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600' }}>
                        {item.id === selectedPartyId ? 'Current' : 'Open'}
                      </Text>
                    </Button>
                    {/* Delete button - only show for party creator */}
                    {user && item.createdBy === user.id && (
                      <Button 
                        onPress={() => handleDeleteParty(item.id, item.name)} 
                        variant="secondary"
                        style={{ backgroundColor: colors.error }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.ink }}>Delete</Text>
                      </Button>
                    )}
                    {/* Debug info - remove this later */}
                    {__DEV__ && (
                      <Text style={{ color: colors.textLow, fontSize: 8 }}>
                        Creator: {item.createdBy?.substring(0, 8)} | User: {user?.id?.substring(0, 8)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </Card>
          );
        }}
      />

      {/* Create/Join Modal */}
      <Modal visible={open} transparent animationType='fade' onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: spacing(2) }} onPress={() => setOpen(false)}>
          <Pressable style={{ backgroundColor: colors.slate, borderRadius: 12, borderColor: colors.steel, borderWidth: 1, padding: 16 }} onPress={(e) => e.stopPropagation()}>
            <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
              {mode === 'create' ? 'Create Party' : 'Join Party'}
            </Text>
            
            {/* Mode Toggle */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <Button 
                variant={mode === 'create' ? 'primary' : 'secondary'} 
                onPress={() => setMode('create')}
                style={{ flex: 1 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600' }}>Create</Text>
              </Button>
              <Button 
                variant={mode === 'join' ? 'primary' : 'secondary'} 
                onPress={() => setMode('join')}
                style={{ flex: 1 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600' }}>Join</Text>
              </Button>
            </View>

            {mode === 'create' ? (
              <ScrollView style={{ maxHeight: 400 }}>
                <View style={{ gap: 12 }}>
                  <View>
                    <Text style={{ color: colors.textMid, marginBottom: 6, fontSize: 14 }}>Name</Text>
                    <TextInput 
                      value={newPartyName} 
                      onChangeText={setNewPartyName} 
                      placeholder='Sunday Sweats' 
                      placeholderTextColor={colors.textLow} 
                      style={{ 
                        color: colors.textHigh, 
                        borderColor: colors.steel, 
                        borderWidth: 1, 
                        borderRadius: 10, 
                        padding: 10,
                        backgroundColor: colors.chip
                      }} 
                    />
                  </View>
                  
                  <View>
                    <Text style={{ color: colors.textMid, marginBottom: 6, fontSize: 14 }}>Type</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Button 
                        variant={newPartyType === 'friendly' ? 'primary' : 'secondary'} 
                        onPress={() => setNewPartyType('friendly')}
                        style={{ flex: 1 }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600' }}>Friendly</Text>
                      </Button>
                      <Button 
                        variant={newPartyType === 'competitive' ? 'primary' : 'secondary'} 
                        onPress={() => setNewPartyType('competitive')}
                        style={{ flex: 1 }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600' }}>Competitive</Text>
                      </Button>
                    </View>
                  </View>

                  {newPartyType === 'competitive' && (
                    <View style={{ backgroundColor: colors.chip, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.steel }}>
                      <Text style={{ color: colors.textHigh, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Competitive Settings</Text>
                      
                      <View style={{ marginBottom: 8 }}>
                        <Text style={{ color: colors.textMid, fontSize: 12, marginBottom: 4 }}>Buy-In ($)</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TextInput
                            placeholder="e.g. 25"
                            placeholderTextColor={colors.textLow}
                            value={tempBuyIn || newBuyIn}
                            onChangeText={handleBuyInChange}
                            keyboardType="numeric"
                            style={{ 
                              flex: 1,
                              color: colors.textHigh, 
                              borderColor: buyInConfirmed ? colors.mint : colors.steel, 
                              borderWidth: 1,
                              borderRadius: 8, 
                              padding: 8,
                              backgroundColor: colors.slate
                            }} 
                          />
                          <Button
                            variant={buyInConfirmed ? 'mint' : 'secondary'}
                            onPress={handleBuyInConfirm}
                            disabled={!tempBuyIn || parseFloat(tempBuyIn) <= 0}
                            style={{ paddingHorizontal: 12 }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '600' }}>
                              {buyInConfirmed ? '✓' : 'Confirm'}
                            </Text>
                          </Button>
                        </View>
                        {buyInConfirmed && (
                          <Text style={{ color: colors.mint, fontSize: 10, marginTop: 4 }}>
                            Buy-in confirmed: ${newBuyIn}
                          </Text>
                        )}
                      </View>
                      
                      {/* Removed sports selector - using default sports */}
                    </View>
                  )}

                  <DateRangePicker
                    startDate={newPartyStart}
                    endDate={newPartyEnd}
                    onStartDateChange={setNewPartyStart}
                    onEndDateChange={setNewPartyEnd}
                    startDateError={dateError}
                    endDateError={dateError}
                  />
                  
                  {dateError && <Text style={{ color: colors.error, fontSize: 12 }}>{dateError}</Text>}
                  {createError && <Text style={{ color: colors.error, fontSize: 12 }}>{createError}</Text>}
                  
                  <Button variant='primary' onPress={handleCreateParty}>
                    <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>Create</Text>
                  </Button>
                </View>
              </ScrollView>
            ) : (
              <View style={{ gap: 12 }}>
                <View>
                  <Text style={{ color: colors.textMid, marginBottom: 6, fontSize: 14 }}>Join code</Text>
                  <TextInput 
                    value={code} 
                    onChangeText={setCode} 
                    placeholder='F-1234 / C-1234' 
                    placeholderTextColor={colors.textLow} 
                    style={{ 
                      color: colors.textHigh, 
                      borderColor: colors.steel, 
                      borderWidth: 1, 
                      borderRadius: 10, 
                      padding: 10,
                      backgroundColor: colors.chip
                    }} 
                  />
                </View>
                
                {code.trim().toUpperCase().startsWith('C') && (
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 }}>
                      <Text style={{ color: colors.textMid, fontSize: 14 }}>Buy-In required ($)</Text>
                      <Badge color={colors.error} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ color: '#000', fontSize: 10, fontWeight: '600' }}>REQUIRED</Text>
                      </Badge>
                    </View>
                    <TextInput
                      placeholder="Enter buy-in amount (e.g. 25)"
                      placeholderTextColor={colors.textLow}
                      value={joinBuyIn}
                      onChangeText={setJoinBuyIn}
                      keyboardType="numeric"
                      style={{ 
                        color: colors.textHigh, 
                        borderColor: joinBuyIn ? colors.mint : colors.steel, 
                        borderWidth: 1, 
                        borderRadius: 10, 
                        padding: 10,
                        backgroundColor: colors.chip
                      }}
                    />
                    <Text style={{ color: colors.textLow, fontSize: 12, marginTop: 4 }}>
                      You have ${wallet.toFixed(2)} in your wallet
                    </Text>
                  </View>
                )}
                
                {dateError && <Text style={{ color: colors.error, fontSize: 12 }}>{dateError}</Text>}
                
                <Button 
                  variant='primary' 
                  onPress={handleJoinParty}
                  disabled={code.trim().toUpperCase().startsWith('C') && (!joinBuyIn.trim() || parseFloat(joinBuyIn) <= 0)}
                  style={{ opacity: code.trim().toUpperCase().startsWith('C') && (!joinBuyIn.trim() || parseFloat(joinBuyIn) <= 0) ? 0.5 : 1 }}
                >
                  <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>
                    {code.trim().toUpperCase().startsWith('C') && (!joinBuyIn.trim() || parseFloat(joinBuyIn) <= 0) 
                      ? 'Enter Buy-In Amount' 
                      : 'Join Party'
                    }
                  </Text>
                </Button>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Invite Code Display Modal */}
      <Modal visible={showInviteCode} transparent animationType='fade' onRequestClose={() => setShowInviteCode(false)}>
        <Pressable style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: spacing(2) }} onPress={() => setShowInviteCode(false)}>
          <Pressable style={{ backgroundColor: colors.slate, borderRadius: 12, borderColor: colors.steel, borderWidth: 1, padding: 16 }} onPress={(e) => e.stopPropagation()}>
            <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
              Party Created Successfully!
            </Text>
            
            <Text style={{ color: colors.textMid, fontSize: 14, marginBottom: 16 }}>
              Share this invite code with friends to let them join your party:
            </Text>
            
            <View style={{ backgroundColor: colors.chip, borderRadius: 8, padding: 16, marginBottom: 16, alignItems: 'center' }}>
              <Text style={{ color: colors.textHigh, fontSize: 24, fontWeight: '700', letterSpacing: 2 }}>
                {inviteCode}
              </Text>
            </View>
            
            <Text style={{ color: colors.textLow, fontSize: 12, marginBottom: 16, textAlign: 'center' }}>
              Party: {createdParty?.name} • {createdParty?.type === 'competitive' ? 'Competitive' : 'Friendly'} • 1/16 members
            </Text>
            
            <Button variant='primary' onPress={() => setShowInviteCode(false)}>
              <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>Got it!</Text>
            </Button>
          </Pressable>
        </Pressable>
      </Modal>
      </View>
    </SafeAreaView>
  );
};