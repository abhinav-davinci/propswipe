import React from 'react';
import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Compass, Heart, TrendingUp, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          ...Platform.select({
            ios: {
              shadowColor: colors.neutral[900],
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 52,
                height: 28,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? colors.primary[50] : 'transparent',
                borderRadius: 14,
              }}
            >
              <Compass
                size={21}
                color={color}
                strokeWidth={focused ? 2.25 : 1.75}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 52,
                height: 28,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? colors.primary[50] : 'transparent',
                borderRadius: 14,
              }}
            >
              <Heart
                size={21}
                color={color}
                strokeWidth={focused ? 2.25 : 1.75}
                fill={focused ? color : 'none'}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 52,
                height: 28,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? colors.primary[50] : 'transparent',
                borderRadius: 14,
              }}
            >
              <TrendingUp
                size={21}
                color={color}
                strokeWidth={focused ? 2.25 : 1.75}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 52,
                height: 28,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? colors.primary[50] : 'transparent',
                borderRadius: 14,
              }}
            >
              <User
                size={21}
                color={color}
                strokeWidth={focused ? 2.25 : 1.75}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
