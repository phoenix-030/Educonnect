import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import '@/global.css';

import { Stack } from 'expo-router';
import React from 'react';

import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style= "auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
