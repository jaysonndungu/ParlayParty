import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from '@/navigation/RootNavigator';
import { StoreProvider } from '@/store/AppStore';

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0E0F13',
    card: '#171A21',
    text: '#E8ECF4',
    border: '#262B36',
    primary: '#FF2E63',
    notification: '#FF2E63'
  }
};

export default function App() {
  return (
    <StoreProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </StoreProvider>
  );
}