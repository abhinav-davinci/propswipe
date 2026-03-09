import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  FadeIn,
  FadeInDown,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Check,
  PartyPopper,
  Clock,
  Bell,
  Eye,
  Sparkles,
  Home,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../src/theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Animated checkmark with ring burst ────────────────────

function SuccessCheckmark() {
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const checkRotate = useSharedValue(-45);
  const glowPulse = useSharedValue(0);

  // Particle burst values (8 particles)
  const particleBurst = useSharedValue(0);

  useEffect(() => {
    // Ring expands
    ringScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    ringOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));

    // Check pops in with bounce
    checkScale.value = withDelay(500, withSpring(1, { damping: 8, stiffness: 200 }));
    checkRotate.value = withDelay(500, withSpring(0, { damping: 10, stiffness: 150 }));

    // Particle burst
    particleBurst.value = withDelay(600, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));

    // Glow breathing
    glowPulse.value = withDelay(800, withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    ));
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: checkScale.value },
      { rotate: `${checkRotate.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.15, 0.4]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [1, 1.15]) }],
  }));

  return (
    <View style={s.checkContainer}>
      {/* Glow behind */}
      <Animated.View style={[s.glowCircle, glowStyle]} />

      {/* Particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Particle key={i} index={i} burst={particleBurst} />
      ))}

      {/* Outer ring */}
      <Animated.View style={[s.outerRing, ringStyle]}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[700]]}
          style={s.outerRingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Inner check circle */}
      <Animated.View style={[s.innerCircle, checkStyle]}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          style={s.innerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Check size={40} color={colors.white} strokeWidth={3} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function Particle({ index, burst }: { index: number; burst: SharedValue<number> }) {
  const angle = (index * 45) * (Math.PI / 180);
  const particleColor = index % 2 === 0 ? colors.primary[400] : colors.accent[400];

  const style = useAnimatedStyle(() => {
    const distance = interpolate(burst.value, [0, 1], [0, 60]);
    const opacity = interpolate(burst.value, [0, 0.3, 1], [0, 1, 0]);
    const scale = interpolate(burst.value, [0, 0.5, 1], [0, 1, 0.3]);

    return {
      transform: [
        { translateX: Math.cos(angle) * distance },
        { translateY: Math.sin(angle) * distance },
        { scale },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: particleColor,
        },
        style,
      ]}
    />
  );
}

// ─── Animated info card ────────────────────────────────────

function InfoCard({
  icon,
  title,
  subtitle,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(delay).springify().damping(15)}
      style={s.infoCard}
    >
      <View style={s.infoIconContainer}>{icon}</View>
      <View style={s.infoTextContainer}>
        <Text style={s.infoTitle}>{title}</Text>
        <Text style={s.infoSubtitle}>{subtitle}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Main screen ───────────────────────────────────────────

export default function ListingSuccessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const btnScale = useSharedValue(1);

  useEffect(() => {
    // Sequential haptics for delight
    const timer1 = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 500);
    const timer2 = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleViewListings = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Dismiss all listing modals then navigate to profile tab
    router.dismissAll();
    setTimeout(() => {
      router.push('/(tabs)/profile');
    }, 100);
  }, [router]);

  const handleGoHome = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.dismissAll();
  }, [router]);

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handlePressIn = useCallback(() => {
    btnScale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    btnScale.value = withSpring(1, { damping: 12, stiffness: 300 });
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Background decoration */}
      <View style={s.bgDecor}>
        <Animated.View
          entering={FadeIn.duration(1000).delay(300)}
          style={s.bgCircle1}
        />
        <Animated.View
          entering={FadeIn.duration(1000).delay(500)}
          style={s.bgCircle2}
        />
      </View>

      {/* Content */}
      <View style={s.content}>
        {/* Sparkle accent */}
        <Animated.View entering={FadeIn.duration(400).delay(300)} style={s.sparkleRow}>
          <Sparkles size={16} color={colors.accent[400]} />
        </Animated.View>

        {/* Checkmark */}
        <SuccessCheckmark />

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.duration(400).delay(700).springify().damping(14)}
          style={s.title}
        >
          Listing Posted!
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.duration(400).delay(850).springify().damping(14)}
          style={s.subtitle}
        >
          Your property is now being reviewed by our team. We'll notify you once it's live.
        </Animated.Text>

        {/* Info cards */}
        <View style={s.cardsContainer}>
          <InfoCard
            icon={<Clock size={20} color={colors.primary[600]} />}
            title="Under Review"
            subtitle="Typically takes 2-3 hours"
            delay={1000}
          />
          <InfoCard
            icon={<Bell size={20} color={colors.accent[500]} />}
            title="Get Notified"
            subtitle="We'll ping you when it's live"
            delay={1150}
          />
          <InfoCard
            icon={<Eye size={20} color={colors.primary[500]} />}
            title="Track Performance"
            subtitle="View stats in My Listings"
            delay={1300}
          />
        </View>
      </View>

      {/* Bottom actions */}
      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <AnimatedPressable
          onPress={handleViewListings}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[s.primaryBtnWrapper, btnAnimStyle]}
        >
          <LinearGradient
            colors={[colors.primary[600], colors.primary[800]]}
            style={s.primaryBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <PartyPopper size={18} color={colors.white} />
            <Text style={s.primaryBtnText}>View My Listings</Text>
          </LinearGradient>
        </AnimatedPressable>

        <Pressable onPress={handleGoHome} style={s.secondaryBtn}>
          <Home size={16} color={colors.neutral[600]} />
          <Text style={s.secondaryBtnText}>Back to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // Background decoration
  bgDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -SCREEN_WIDTH * 0.3,
    right: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    backgroundColor: colors.primary[50],
    opacity: 0.6,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -SCREEN_WIDTH * 0.15,
    left: -SCREEN_WIDTH * 0.25,
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: SCREEN_WIDTH * 0.3,
    backgroundColor: colors.accent[50],
    opacity: 0.5,
  },

  // Content
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  sparkleRow: {
    marginBottom: 12,
  },

  // Checkmark
  checkContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  glowCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[200],
  },
  outerRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 3,
  },
  outerRingGradient: {
    flex: 1,
    borderRadius: 55,
    opacity: 0.15,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[700],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  innerGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text
  title: {
    fontFamily: fontFamilies.headingExtrabold,
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights['3xl'],
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.lg,
    color: colors.neutral[500],
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 32,
  },

  // Info cards
  cardsContainer: {
    width: '100%',
    gap: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  infoTextContainer: {
    flex: 1,
    gap: 2,
  },
  infoTitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[800],
  },
  infoSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[500],
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  primaryBtnWrapper: {
    alignSelf: 'stretch',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 8,
  },
  primaryBtnText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.white,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    gap: 6,
  },
  secondaryBtnText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[600],
  },
});
