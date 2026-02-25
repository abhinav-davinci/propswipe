import React from 'react';
import { Pressable, Text } from 'react-native';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
}

export function Chip({ label, selected = false, onPress, size = 'md' }: ChipProps) {
  const sizeClass = size === 'sm' ? 'px-2.5 py-1' : 'px-4 py-2';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-sm ${sizeClass} ${
        selected
          ? 'bg-primary-600 border border-primary-600'
          : 'bg-white border border-neutral-200'
      }`}
      style={({ pressed }) => pressed ? { opacity: 0.8 } : {}}
    >
      <Text
        className={`${textSize} font-body-medium ${
          selected ? 'text-white' : 'text-neutral-700'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
