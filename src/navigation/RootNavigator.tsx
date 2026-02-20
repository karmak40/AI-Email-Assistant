import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AuthScreen, GmailAuthScreen, MessageDetailScreen } from '../screens';
import { supabase } from '../services/supabase';
import { RootStackParamList } from '../types';
import { BottomTabNavigator } from './BottomTabNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { colors } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Effect для навигации при изменении статуса аутентификации
  useEffect(() => {
    if (isAuthenticated === null || !navigationRef.current) {
      return;
    }

    navigationRef.current.reset({
      index: 0,
      routes: [{ name: isAuthenticated ? 'BottomTabs' : 'Auth' }],
    });
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return (
      <View 
        style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: colors.background 
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
        initialRouteName={isAuthenticated ? 'BottomTabs' : 'Auth'}
      >
        {/* Auth Screen - always present */}
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
        />

        {/* Main App Screens - always present */}
        <Stack.Screen 
          name="BottomTabs" 
          component={BottomTabNavigator}
        />

        {/* Gmail Auth Screen - modal on top */}
        <Stack.Screen
          name="GmailAuth"
          component={GmailAuthScreen}
        />

        {/* Message Detail Screen */}
        <Stack.Screen
          name="MessageDetail"
          component={MessageDetailScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
