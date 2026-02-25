import React from 'react';
import { View, Text, ViewStyle, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  type AnimatedStyle,
  type SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Heart, X, Star } from 'lucide-react-native';

const SWIPE_UP_THRESHOLD = 120; // positive for cleaner math (negate translateY)

interface SwipeOverlayProps {
  likeOpacity: AnimatedStyle<ViewStyle>;
  nopeOpacity: AnimatedStyle<ViewStyle>;
  superlikeOpacity: AnimatedStyle<ViewStyle>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
}

export function SwipeOverlay({
  likeOpacity,
  nopeOpacity,
  superlikeOpacity,
  translateX,
  translateY,
}: SwipeOverlayProps) {
  const { width } = useWindowDimensions();
  const swipeThreshold = width * 0.3;

  // ─── LIKED (right swipe) ───

  const likedBadgeStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateX.value,
      [0, swipeThreshold * 0.5, swipeThreshold],
      [0.6, 0.85, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity: interpolate(translateX.value, [0, swipeThreshold * 0.4, swipeThreshold], [0, 0.6, 1], Extrapolation.CLAMP),
      transform: [
        { scale: progress },
        { rotate: '-12deg' },
      ],
    };
  });

  const likeTintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, swipeThreshold * 0.3, swipeThreshold], [0, 0.08, 0.25], Extrapolation.CLAMP),
  }));

  const likeGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, swipeThreshold * 0.5, swipeThreshold], [0, 0.3, 0.8], Extrapolation.CLAMP),
  }));

  // ─── NOPE (left swipe) ───

  const passBadgeStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateX.value,
      [-swipeThreshold, -swipeThreshold * 0.5, 0],
      [1, 0.85, 0.6],
      Extrapolation.CLAMP
    );
    return {
      opacity: interpolate(translateX.value, [-swipeThreshold, -swipeThreshold * 0.4, 0], [1, 0.6, 0], Extrapolation.CLAMP),
      transform: [
        { scale: progress },
        { rotate: '12deg' },
      ],
    };
  });

  const nopeTintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-swipeThreshold, -swipeThreshold * 0.3, 0], [0.25, 0.08, 0], Extrapolation.CLAMP),
  }));

  const nopeGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-swipeThreshold, -swipeThreshold * 0.5, 0], [0.8, 0.3, 0], Extrapolation.CLAMP),
  }));

  // ─── SUPER LIKED (swipe up) ───
  // We use -translateY (positive going up) for cleaner interpolation

  const superlikeBadgeStyle = useAnimatedStyle(() => {
    const upProgress = -translateY.value; // 0 → SWIPE_UP_THRESHOLD as user swipes up
    const progress = interpolate(
      upProgress,
      [0, SWIPE_UP_THRESHOLD * 0.5, SWIPE_UP_THRESHOLD],
      [0.5, 0.85, 1.1],
      Extrapolation.CLAMP
    );
    return {
      opacity: interpolate(upProgress, [0, SWIPE_UP_THRESHOLD * 0.3, SWIPE_UP_THRESHOLD], [0, 0.6, 1], Extrapolation.CLAMP),
      transform: [
        { scale: progress },
      ],
    };
  });

  const superlikeTintStyle = useAnimatedStyle(() => {
    const upProgress = -translateY.value;
    return {
      opacity: interpolate(upProgress, [0, SWIPE_UP_THRESHOLD * 0.3, SWIPE_UP_THRESHOLD], [0, 0.1, 0.3], Extrapolation.CLAMP),
    };
  });

  const superlikeGlowStyle = useAnimatedStyle(() => {
    const upProgress = -translateY.value;
    return {
      opacity: interpolate(upProgress, [0, SWIPE_UP_THRESHOLD * 0.5, SWIPE_UP_THRESHOLD], [0, 0.3, 0.85], Extrapolation.CLAMP),
    };
  });

  return (
    <>
      {/* ===== LIKED (right swipe) ===== */}

      {/* Full-card green tint */}
      <Animated.View
        style={[StyleSheet.absoluteFill, likeTintStyle, { backgroundColor: '#15803D', borderRadius: 16, zIndex: 5 }]}
        pointerEvents="none"
      />

      {/* Left edge green glow */}
      <Animated.View
        style={[likeGlowStyle, styles.edgeGlow, styles.leftGlow]}
        pointerEvents="none"
      />

      {/* LIKED badge */}
      <Animated.View style={[styles.badgeContainer, styles.badgeTopLeft, likedBadgeStyle]} pointerEvents="none">
        <View style={styles.likedBadge}>
          <Heart size={28} color="#fff" fill="#fff" />
          <Text style={styles.likedText}>LIKED</Text>
        </View>
      </Animated.View>

      {/* ===== NOPE (left swipe) ===== */}

      {/* Full-card red tint */}
      <Animated.View
        style={[StyleSheet.absoluteFill, nopeTintStyle, { backgroundColor: '#DC2626', borderRadius: 16, zIndex: 5 }]}
        pointerEvents="none"
      />

      {/* Right edge red glow */}
      <Animated.View
        style={[nopeGlowStyle, styles.edgeGlow, styles.rightGlow]}
        pointerEvents="none"
      />

      {/* NOPE badge */}
      <Animated.View style={[styles.badgeContainer, styles.badgeTopRight, passBadgeStyle]} pointerEvents="none">
        <View style={styles.passBadge}>
          <X size={28} color="#fff" strokeWidth={3} />
          <Text style={styles.passText}>NOPE</Text>
        </View>
      </Animated.View>

      {/* ===== SUPER LIKED (swipe up) ===== */}

      {/* Full-card amber tint */}
      <Animated.View
        style={[StyleSheet.absoluteFill, superlikeTintStyle, { backgroundColor: '#E8960F', borderRadius: 16, zIndex: 5 }]}
        pointerEvents="none"
      />

      {/* Bottom edge amber glow */}
      <Animated.View
        style={[superlikeGlowStyle, styles.edgeGlowHorizontal, styles.bottomGlow]}
        pointerEvents="none"
      />

      {/* SUPER LIKED badge */}
      <Animated.View style={[styles.badgeContainer, styles.badgeCenter, superlikeBadgeStyle]} pointerEvents="none">
        <View style={styles.superlikeBadge}>
          <Star size={26} color="#fff" fill="#fff" />
          <Text style={styles.superlikeText}>SUPER LIKED</Text>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  // Vertical edge glow (left/right)
  edgeGlow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    zIndex: 6,
    borderRadius: 16,
  },
  leftGlow: {
    left: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 4,
    borderLeftColor: '#15803D',
    shadowColor: '#15803D',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  rightGlow: {
    right: 0,
    backgroundColor: 'transparent',
    borderRightWidth: 4,
    borderRightColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },

  // Horizontal edge glow (top/bottom)
  edgeGlowHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 80,
    zIndex: 6,
    borderRadius: 16,
  },
  bottomGlow: {
    bottom: 0,
    backgroundColor: 'transparent',
    borderBottomWidth: 4,
    borderBottomColor: '#E8960F',
    shadowColor: '#E8960F',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },

  // Badge containers
  badgeContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  badgeTopLeft: {
    top: 24,
    left: 20,
  },
  badgeTopRight: {
    top: 24,
    right: 20,
  },
  badgeCenter: {
    top: '40%',
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  // LIKED badge
  likedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(21, 128, 61, 0.92)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  likedText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 2,
  },

  // NOPE badge
  passBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.92)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  passText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 2,
  },

  // SUPER LIKED badge
  superlikeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(232, 150, 15, 0.94)',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#B87208',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  superlikeText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 2,
  },
});
