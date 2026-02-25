import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { colors } from '../../theme/colors';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

export function LoadingSpinner({ message, size = 'large' }: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-50">
      <ActivityIndicator size={size} color={colors.primary[600]} />
      {message && (
        <Text className="text-sm text-neutral-500 mt-3 font-body">{message}</Text>
      )}
    </View>
  );
}
