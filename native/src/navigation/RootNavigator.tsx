import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { PartiesScreen } from '@/screens/PartiesScreen';
import { BoardScreen } from '@/screens/BoardScreen';
import { LeadersScreen } from '@/screens/LeadersScreen';
import { MyPollsScreen } from '@/screens/MyPollsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { AuthScreen } from '@/screens/AuthScreen';
import { GameDetailScreen } from '@/screens/GameDetailScreen';
import { ClutchVoteScreen } from '@/screens/ClutchVoteScreen';
import { ParlayDetailScreen } from '@/screens/ParlayDetailScreen';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store/AppStore';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#171A21', borderTopColor: '#262B36' },
        tabBarActiveTintColor: '#FF2E63',
        tabBarInactiveTintColor: '#A4AEC0',
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            Board: 'trophy-outline',
            Parties: 'people-outline',
            Leaders: 'list-outline',
            'My Polls': 'chatbubbles-outline',
            Profile: 'person-outline',
          };
          const name = map[route.name] || 'ellipse-outline';
          return <Ionicons name={name} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Board" component={BoardScreen} />
      <Tab.Screen name="Parties" component={PartiesScreen} />
      <Tab.Screen name="Leaders" component={LeadersScreen} />
      <Tab.Screen name="My Polls" component={MyPollsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { isAuthenticated } = useStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="GameDetail" component={GameDetailScreen} />
          <Stack.Screen name="ClutchVote" component={ClutchVoteScreen} />
          <Stack.Screen name="ParlayDetail" component={ParlayDetailScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
};