import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../../theme/colors';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, showBack = false, rightAction }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <View className="flex-row items-center flex-1">
        {showBack && (
          <Pressable onPress={() => router.back()} className="mr-2 p-1">
            <ChevronLeft size={24} color={colors.neutral[900]} />
          </Pressable>
        )}
        <Text className="text-xl font-heading text-neutral-900" numberOfLines={1}>
          {title}
        </Text>
      </View>
      {rightAction && <View>{rightAction}</View>}
    </View>
  );
}
