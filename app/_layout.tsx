import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#1E293B',
      headerShadowVisible: false,
    }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: 'Home'
        }} 
      />
      <Stack.Screen 
        name="transfer" 
        options={{ 
          title: 'Send Money',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="recipients" 
        options={{ 
          title: 'Select Recipient',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="confirmation" 
        options={{ 
          headerShown: false,
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="transactions" 
        options={{ 
          title: 'Transaction History',
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}
