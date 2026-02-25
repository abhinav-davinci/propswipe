import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { colors } from '../../theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string; pressedBg: string }> = {
  primary: {
    container: 'bg-primary-600',
    text: 'text-white',
    pressedBg: 'bg-primary-700',
  },
  secondary: {
    container: 'bg-primary-50',
    text: 'text-primary-600',
    pressedBg: 'bg-primary-100',
  },
  outline: {
    container: 'bg-transparent border border-neutral-300',
    text: 'text-neutral-700',
    pressedBg: 'bg-neutral-100',
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-primary-600',
    pressedBg: 'bg-primary-50',
  },
  accent: {
    container: 'bg-accent-500',
    text: 'text-white',
    pressedBg: 'bg-accent-600',
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'px-3 py-1.5', text: 'text-sm' },
  md: { container: 'px-5 py-3', text: 'text-base' },
  lg: { container: 'px-6 py-4', text: 'text-lg' },
};

const textColors: Record<ButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.primary[600],
  outline: colors.neutral[700],
  ghost: colors.primary[600],
  accent: colors.white,
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconRight,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const vStyle = variantStyles[variant];
  const sStyle = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center rounded-md ${vStyle.container} ${sStyle.container} ${
        disabled ? 'opacity-50' : ''
      } ${fullWidth ? 'w-full' : ''} ${className}`}
      style={({ pressed }) => pressed ? { opacity: 0.85 } : {}}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColors[variant]} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={`font-heading-semibold ${vStyle.text} ${sStyle.text}`}>
            {title}
          </Text>
          {iconRight}
        </View>
      )}
    </Pressable>
  );
}
