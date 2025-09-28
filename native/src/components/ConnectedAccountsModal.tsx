import React from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

interface ConnectedAccountsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface BettingApp {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  status: 'connected' | 'connect';
}

const bettingApps: BettingApp[] = [
  {
    id: 'prizepicks',
    name: 'PrizePicks',
    logo: '🏆', // Trophy emoji for PrizePicks
    connected: true,
    status: 'connected'
  },
  {
    id: 'underdog',
    name: 'Underdog',
    logo: '🐕', // Dog emoji for Underdog
    connected: false,
    status: 'connect'
  },
  {
    id: 'draftkings',
    name: 'DraftKings',
    logo: '🎯', // Target emoji for DraftKings
    connected: false,
    status: 'connect'
  },
  {
    id: 'sleeper',
    name: 'Sleeper',
    logo: '💤', // Sleep emoji for Sleeper
    connected: false,
    status: 'connect'
  }
];

export const ConnectedAccountsModal: React.FC<ConnectedAccountsModalProps> = ({ visible, onClose }) => {
  const handleConnect = (appId: string) => {
    // Simulate connection process
    console.log(`Connecting to ${appId}...`);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing(2)
      }}>
        <View style={{
          backgroundColor: colors.slate,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.steel,
          width: '100%',
          maxWidth: 400,
          maxHeight: '80%'
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: spacing(2),
            borderBottomWidth: 1,
            borderBottomColor: colors.steel
          }}>
            <Text style={{
              color: colors.textHigh,
              fontSize: 18,
              fontWeight: '700'
            }}>
              Connected Accounts
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: colors.neutralChip,
                paddingHorizontal: spacing(2),
                paddingVertical: spacing(1),
                borderRadius: 6,
                borderWidth: 1,
                borderColor: colors.steel
              }}
            >
              <Text style={{
                color: colors.textHigh,
                fontSize: 12,
                fontWeight: '600'
              }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={{ padding: spacing(2) }}>
            <Text style={{
              color: colors.textMid,
              fontSize: 14,
              marginBottom: spacing(2),
              textAlign: 'center'
            }}>
              Connect your betting accounts to sync data with ParlayParty
            </Text>

            {/* Apps List */}
            {bettingApps.map((app) => (
              <View
                key={app.id}
                style={{
                  backgroundColor: colors.slate,
                  padding: spacing(2),
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.steel,
                  marginBottom: spacing(1.5)
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(1.5) }}>
                  <Text style={{ fontSize: 28, marginRight: spacing(2) }}>
                    {app.logo}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: colors.textHigh,
                      fontSize: 16,
                      fontWeight: '700',
                      marginBottom: spacing(0.5)
                    }}>
                      {app.name}
                    </Text>
                    {app.connected && (
                      <Text style={{ color: colors.mint, fontSize: 12, fontWeight: '600' }}>
                        ✓ Connected
                      </Text>
                    )}
                  </View>
                </View>
                
                <TouchableOpacity
                  onPress={() => handleConnect(app.id)}
                  style={{
                    backgroundColor: app.connected ? colors.mint : 'transparent',
                    paddingHorizontal: spacing(2),
                    paddingVertical: spacing(1.5),
                    borderRadius: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: app.connected ? colors.mint : '#ffffff'
                  }}
                >
                  <Text style={{
                    color: app.connected ? '#000' : '#ffffff',
                    fontSize: 14,
                    fontWeight: '700'
                  }}>
                    {app.status === 'connected' ? 'Successfully Connected' : 'Connect Account'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={{
              backgroundColor: colors.slate,
              padding: spacing(2),
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.steel,
              marginTop: spacing(2)
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing(1) }}>
                <Text style={{ color: colors.mint, fontSize: 16, marginRight: spacing(1) }}>🔒</Text>
                <Text style={{
                  color: colors.textHigh,
                  fontSize: 14,
                  fontWeight: '700'
                }}>
                  Secure Connection
                </Text>
              </View>
              <Text style={{
                color: colors.textMid,
                fontSize: 12,
                textAlign: 'center',
                lineHeight: 16
              }}>
                All connections are encrypted and secure.{'\n'}We never store your passwords.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
