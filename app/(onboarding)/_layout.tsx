import React from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { colors } from '../../src/theme/colors';

function ProgressBar() {
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <View className="px-4 pt-2 pb-1 bg-neutral-50">
      <View className="h-1 bg-neutral-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-primary-600 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
      <Text className="text-xs text-neutral-500 font-body mt-1 text-right">
        {currentStep + 1} of {totalSteps}
      </Text>
    </View>
  );
}

export default function OnboardingLayout() {
  return (
    <View className="flex-1 bg-neutral-50">
      <View className="pt-14">
        <ProgressBar />
      </View>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="name" />
        <Stack.Screen name="intent" />
        <Stack.Screen name="location-budget" />
        <Stack.Screen name="match-animation" />
      </Stack>
    </View>
  );
}
