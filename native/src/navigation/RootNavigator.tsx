import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PartiesScreen } from '@/screens/PartiesScreen';
import { BoardScreen } from '@/screens/BoardScreen';
import { LeadersScreen } from '@/screens/LeadersScreen';
import { MyPollsScreen } from '@/screens/MyPollsScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export const RootNavigator = () => {
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
    </Tab.Navigator>
  );
};