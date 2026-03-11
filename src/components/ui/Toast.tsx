import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Check, X, AlertTriangle, Info } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../theme/typography';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss: () => void;
}

const variantConfig: Record<ToastVariant, {
  icon: typeof Check;
  iconColor: string;
  iconBg: string;
  borderColor: string;
}> = {
  success: {
    icon: Check,
    iconColor: colors.white,
    iconBg: colors.success,
    borderColor: '#C8E6C9',
  },
  error: {
    icon: X,
    iconColor: colors.white,
    iconBg: colors.error,
    borderColor: '#FFCDD2',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: colors.white,
    iconBg: colors.warning,
    borderColor: colors.accent[200],
  },
  info: {
    icon: Info,
    iconColor: colors.white,
    iconBg: colors.info,
    borderColor: '#B3D4FC',
  },
};

export function Toast({
  visible,
  message,
  variant = 'success',
  duration = 2500,
  onDismiss,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  const dismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      // Slide in, hold, then slide out — chained via withSequence
      translateY.value = withSequence(
        withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withDelay(duration,
          withTiming(-100, { duration: 250, easing: Easing.in(Easing.cubic) })
        ),
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 250 }),
        withDelay(duration,
          withTiming(0, { duration: 200 })
        ),
      );
      scale.value = withSequence(
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withDelay(duration,
          withTiming(0.95, { duration: 250 })
        ),
      );

      // Callback after full animation cycle
      const timer = setTimeout(dismiss, duration + 600);
      return () => clearTimeout(timer);
    } else {
      translateY.value = -100;
      opacity.value = 0;
      scale.value = 0.95;
    }
  }, [visible, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 8 },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <Pressable onPress={dismiss} style={[styles.toast, { borderColor: config.borderColor }]}>
        <View style={[styles.iconCircle, { backgroundColor: config.iconBg }]}>
          <IconComponent size={14} color={config.iconColor} strokeWidth={2.5} />
        </View>
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[800],
  },
});
