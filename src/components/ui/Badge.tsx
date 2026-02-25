import React from 'react';
import { View, Text } from 'react-native';
import { getMatchScoreColors } from '../../theme/colors';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<string, { container: string; text: string }> = {
  default: { container: 'bg-neutral-100', text: 'text-neutral-700' },
  success: { container: 'bg-green-100', text: 'text-green-800' },
  error: { container: 'bg-red-100', text: 'text-red-800' },
  warning: { container: 'bg-amber-100', text: 'text-amber-800' },
  info: { container: 'bg-blue-100', text: 'text-blue-800' },
};

export function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  const style = variantStyles[variant];
  return (
    <View className={`rounded-sm px-2 py-0.5 ${style.container}`}>
      <Text className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-body-medium ${style.text}`}>
        {label}
      </Text>
    </View>
  );
}

export function MatchScoreBadge({ score, size = 'md' }: MatchScoreBadgeProps) {
  const { bg, text } = getMatchScoreColors(score);
  const sizeMap = {
    sm: { container: 'px-1.5 py-0.5', text: 'text-xs' },
    md: { container: 'px-2.5 py-1', text: 'text-sm' },
    lg: { container: 'px-3 py-1.5', text: 'text-base' },
  };
  const s = sizeMap[size];

  return (
    <View className={`rounded-sm ${s.container}`} style={{ backgroundColor: bg }}>
      <Text className={`font-heading ${s.text}`} style={{ color: text }}>
        {score}% Match
      </Text>
    </View>
  );
}
