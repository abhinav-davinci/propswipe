import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  FadeIn,
  FadeInDown,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Play,
  CheckCircle2,
  TrendingUp,
  Eye,
  Award,
  Sparkles,
  Film,
  ImageIcon,
  Zap,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../src/theme/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressableButton({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
}) {
  const scale = useSharedValue(1);
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  }, []);
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  }, []);
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── Animated photo stack (hero visual) ────────────────────

const STACK_IMAGES = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=70',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&q=70',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&q=70',
];

function PhotoStackAnimation({ photoCount }: { photoCount: number }) {
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    float1.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, true
    );
    float2.value = withDelay(300,
      withRepeat(
        withSequence(
          withTiming(4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          withTiming(-4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, true
      )
    );
    float3.value = withDelay(600,
      withRepeat(
        withSequence(
          withTiming(-3, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
          withTiming(3, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, true
      )
    );
    shimmer.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
  }, []);

  const card1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: float1.value },
      { rotate: '-8deg' },
    ],
  }));

  const card2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: float2.value },
    ],
  }));

  const card3Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: float3.value },
      { rotate: '6deg' },
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.stackWrapper}>
      <View style={styles.stackContainer}>
        {/* Left card */}
        <Animated.View style={[styles.stackCard, styles.stackCard1, card1Style]}>
          <Image source={{ uri: STACK_IMAGES[0] }} style={styles.stackCardImage} />
        </Animated.View>

        {/* Center card (behind play button) */}
        <Animated.View style={[styles.stackCard, styles.stackCard2, card2Style]}>
          <Image source={{ uri: STACK_IMAGES[1] }} style={styles.stackCardImage} />
        </Animated.View>

        {/* Right card */}
        <Animated.View style={[styles.stackCard, styles.stackCard3, card3Style]}>
          <Image source={{ uri: STACK_IMAGES[2] }} style={styles.stackCardImage} />
        </Animated.View>

        {/* Play button — floats above all cards */}
        <View style={styles.playCircleOuter}>
          <Animated.View style={[styles.playCircleShimmer, shimmerStyle]} />
          <View style={styles.playCircleInner}>
            <Play size={22} color={colors.white} fill={colors.white} />
          </View>
        </View>
      </View>

      {/* Photo count badge — outside the stack so it can't be overlapped */}
      <View style={styles.photoCountBadge}>
        <ImageIcon size={12} color={colors.white} />
        <Text style={styles.photoCountText}>{photoCount} photos</Text>
      </View>
    </View>
  );
}

// ─── Stat badge ────────────────────────────────────────────

function StatBadge({
  icon,
  value,
  label,
  delay,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)} style={styles.statBadge}>
      <View style={styles.statIconCircle}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// ─── Generating state ──────────────────────────────────────

function GeneratingView() {
  const progress = useSharedValue(0);
  const [stage, setStage] = useState(0);

  const stages = [
    'Analyzing your photos...',
    'Composing cinematic scenes...',
    'Adding smooth transitions...',
    'Finalizing your video tour...',
  ];

  useEffect(() => {
    progress.value = withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) });

    const interval = setInterval(() => {
      setStage((prev) => {
        if (prev < stages.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.generatingContainer}>
      <View style={styles.generatingIconCircle}>
        <Film size={28} color={colors.primary[600]} />
      </View>

      <Text style={styles.generatingTitle}>Creating Your Video Tour</Text>

      <Animated.View entering={FadeIn.duration(300).delay(200)}>
        <Text style={styles.generatingStage}>{stages[stage]}</Text>
      </Animated.View>

      <View style={styles.progressBarBg}>
        <Animated.View style={[styles.progressBarFill, barStyle]}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>

      <Text style={styles.generatingHint}>
        This usually takes a few seconds
      </Text>
    </Animated.View>
  );
}

// ─── Main screen ───────────────────────────────────────────

export default function AIVideoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ photoCount?: string }>();
  const photoCount = parseInt(params.photoCount || '0', 10);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsGenerating(true);

    // Mock generation — navigate to preview after "processing"
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/listing/preview?withImages=1');
    }, 6500);
  }, [router]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/listing/preview?withImages=1');
  }, [router]);

  if (isGenerating) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.generatingScreen}>
          <GeneratingView />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Success header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.successHeader}>
        <CheckCircle2 size={20} color={colors.success} fill={colors.success} />
        <Text style={styles.successText}>
          {photoCount} photo{photoCount !== 1 ? 's' : ''} uploaded successfully!
        </Text>
      </Animated.View>

      {/* Scrollable content */}
      <View style={styles.content}>
        {/* Hero visual */}
        <Animated.View entering={FadeIn.duration(600).delay(200)}>
          <PhotoStackAnimation photoCount={photoCount} />
        </Animated.View>

        {/* Headline */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.headlineSection}>
          <View style={styles.newBadge}>
            <Zap size={10} color={colors.white} fill={colors.white} />
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
          <Text style={styles.headline}>
            Make your listing{'\n'}unmissable
          </Text>
          <Text style={styles.subheadline}>
            Transform your photos into a stunning AI video tour.{' '}
            <Text style={styles.subheadlineHighlight}>
              Listings with videos get 3x more enquiries
            </Text>{' '}
            and sell faster.
          </Text>
        </Animated.View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBadge
            icon={<TrendingUp size={18} color={colors.primary[600]} />}
            value="+300%"
            label="Engagement"
            delay={600}
          />
          <StatBadge
            icon={<Eye size={18} color={colors.primary[600]} />}
            value="Top"
            label="Rankings"
            delay={700}
          />
          <StatBadge
            icon={<Award size={18} color={colors.accent[500]} />}
            value="Premium"
            label="Stand Out"
            delay={800}
          />
        </View>
      </View>

      {/* Pinned bottom CTA */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(900)}
        style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
      >
        <PressableButton onPress={handleGenerate} style={styles.generateBtnOuter}>
          <LinearGradient
            colors={[colors.primary[600], colors.primary[800]]}
            style={styles.generateBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.generateBtnIconCircle}>
              <Play size={14} color={colors.primary[700]} fill={colors.primary[700]} />
            </View>
            <Text style={styles.generateBtnText}>Generate AI Video Tour</Text>
          </LinearGradient>
        </PressableButton>

        <Pressable onPress={handleSkip} style={styles.skipBtn} hitSlop={12}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // Success header
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    backgroundColor: colors.primary[50],
  },
  successText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.success,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: 'center',
    gap: 24,
  },

  // Photo stack animation
  stackWrapper: {
    alignItems: 'center',
    gap: 12,
  },
  stackContainer: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    width: 260,
  },
  stackCard: {
    position: 'absolute',
    width: 90,
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  stackCardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  stackCard1: {
    left: 8,
    top: 12,
    zIndex: 1,
  },
  stackCard2: {
    zIndex: 2,
  },
  stackCard3: {
    right: 8,
    top: 12,
    zIndex: 1,
  },
  playCircleOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  playCircleShimmer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    backgroundColor: colors.primary[200],
  },
  playCircleInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  photoCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.neutral[800],
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  photoCountText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.white,
  },

  // Headline
  headlineSection: {
    alignItems: 'center',
    gap: 10,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent[500],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: 10,
    color: colors.white,
    letterSpacing: 1,
  },
  headline: {
    fontFamily: fontFamilies.headingExtrabold,
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights['2xl'],
    color: colors.neutral[900],
    textAlign: 'center',
  },
  subheadline: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.base,
    color: colors.neutral[500],
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  subheadlineHighlight: {
    fontFamily: fontFamilies.bodyMedium,
    color: colors.primary[700],
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  statBadge: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[900],
  },
  statLabel: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[500],
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  generateBtnOuter: {
    alignSelf: 'stretch',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 16,
  },
  generateBtnIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateBtnText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.white,
    letterSpacing: 0.3,
  },
  skipBtn: {
    paddingVertical: 12,
  },
  skipText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[400],
  },

  // Generating state
  generatingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  generatingContainer: {
    alignItems: 'center',
    gap: 20,
    width: '100%',
  },
  generatingIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[100],
  },
  generatingTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  generatingStage: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  progressBarBg: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral[100],
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  generatingHint: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 4,
  },
});
