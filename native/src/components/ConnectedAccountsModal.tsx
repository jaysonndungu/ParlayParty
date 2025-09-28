import React from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

interface ConnectedAccountsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface BettingApp {
  name: string;
  logo: string;
  connected: boolean;
  onConnect: () => void;
}

export const ConnectedAccountsModal: React.FC<ConnectedAccountsModalProps> = ({
  visible,
  onClose,
}) => {
  const bettingApps: BettingApp[] = [
    {
      name: 'PrizePicks',
      logo: '🎯',
      connected: true,
      onConnect: () => {
        // PrizePicks is already connected
        console.log('PrizePicks is already connected');
      },
    },
    {
      name: 'Underdog',
      logo: '🐕',
      connected: false,
      onConnect: () => {
        // Simulate connecting to Underdog
        console.log('Connecting to Underdog...');
      },
    },
    {
      name: 'DraftKings',
      logo: '👑',
      connected: false,
      onConnect: () => {
        // Simulate connecting to DraftKings
        console.log('Connecting to DraftKings...');
      },
    },
    {
      name: 'Sleeper',
      logo: '💤',
      connected: false,
      onConnect: () => {
        // Simulate connecting to Sleeper
        console.log('Connecting to Sleeper...');
      },
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Connected Sportsbooks</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Connect your betting accounts to sync your picks and track your performance across platforms.
            </Text>

            <View style={styles.appsList}>
              {bettingApps.map((app, index) => (
                <View key={index} style={styles.appItem}>
                  <View style={styles.appInfo}>
                    <Text style={styles.appLogo}>{app.logo}</Text>
                    <View style={styles.appDetails}>
                      <Text style={styles.appName}>{app.name}</Text>
                      {app.connected && (
                        <Text style={styles.connectedText}>Successfully Connected</Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.appActions}>
                    {app.connected ? (
                      <View style={styles.connectedBadge}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.connectButton}
                        onPress={app.onConnect}
                      >
                        <Text style={styles.connectButtonText}>Connect</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.securityNote}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>
                Your betting data is encrypted and secure. We only read your public betting information.
              </Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(3),
  },
  modal: {
    backgroundColor: colors.slate,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.steel,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(3),
    borderBottomWidth: 1,
    borderBottomColor: colors.steel,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textHigh,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.chip,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.textMid,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: spacing(3),
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMid,
    marginBottom: spacing(3),
    lineHeight: 20,
  },
  appsList: {
    gap: spacing(2),
    marginBottom: spacing(3),
  },
  appItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(2),
    backgroundColor: colors.chip,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.steel,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appLogo: {
    fontSize: 24,
    marginRight: spacing(2),
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textHigh,
    marginBottom: 2,
  },
  connectedText: {
    fontSize: 12,
    color: colors.mint,
    fontWeight: '500',
  },
  appActions: {
    marginLeft: spacing(2),
  },
  connectButton: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  connectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing(2),
    backgroundColor: colors.steel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.chip,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: spacing(1),
    marginTop: 1,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: colors.textMid,
    lineHeight: 16,
  },
});