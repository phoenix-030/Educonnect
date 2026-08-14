import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { getHomeRoute } from '@/lib/roleRoutes';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }
  if (user) {
    return <Redirect href={getHomeRoute(user.role)} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
