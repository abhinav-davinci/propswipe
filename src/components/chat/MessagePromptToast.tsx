import React, { useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { MessageCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../theme/typography';
import type { Property } from '../../types/property';

interface MessagePromptToastProps {
  visible: boolean;
  property: Property | null;
  onMessage: () => void;
  onDismiss: () => void;
}

export function MessagePromptToast({
  visible,
  property,
  onMessage,
  onDismiss,
}: MessagePromptToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  const dismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (visible && property) {
      translateY.value = withSequence(
        withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withDelay(
          4000,
          withTiming(-120, { duration: 250, easing: Easing.in(Easing.cubic) })
        )
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 250 }),
        withDelay(4000, withTiming(0, { duration: 200 }))
      );
      scale.value = withSequence(
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withDelay(4000, withTiming(0.95, { duration: 250 }))
      );

      const timer = setTimeout(dismiss, 4600);
      return () => clearTimeout(timer);
    } else {
      translateY.value = -120;
      opacity.value = 0;
      scale.value = 0.95;
    }
  }, [visible, property]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleMessage = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Cancel auto-dismiss animation
    translateY.value = withTiming(-120, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => {
      onMessage();
    }, 220);
  }, [onMessage]);

  if (!visible || !property) return null;

  return (
    <Animated.View
      style={[styles.container, { top: insets.top + 8 }, animatedStyle]}
      pointerEvents="box-none"
    >
      <Pressable onPress={dismiss} style={styles.toast}>
        <Image
          source={{ uri: property.agent.image }}
          style={styles.avatar}
        />
        <Text style={styles.message} numberOfLines={1}>
          Liked! Message {property.agent.name}?
        </Text>
        <Pressable onPress={handleMessage} style={styles.messageChip}>
          <MessageCircle size={14} color={colors.white} />
          <Text style={styles.chipText}>Message</Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 6,
    borderWidth: 1,
    borderColor: colors.primary[100],
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[200],
  },
  message: {
    flex: 1,
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[800],
  },
  messageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.xs,
    color: colors.white,
  },
});
