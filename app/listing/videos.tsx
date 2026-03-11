import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Modal,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Zap,
  Download,
  Maximize2,
  RefreshCw,
  Check,
  Clock,
  Eye,
  X,
  Volume2,
  VolumeX,
  Film,
  MapPin,
  Phone,
  Sparkles,
  Headphones,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../src/theme/typography';
import { Toast } from '../../src/components/ui/Toast';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mock data
const MOCK_VIDEO = {
  id: 'v1',
  thumbnailUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
  videoUrl: 'https://assets.mixkit.co/videos/4046/4046-720.mp4',
  duration: '0:15',
  generatedAt: '1:33 PM',
  propertyTitle: 'Spacious 3BHK Apartment',
  location: 'Koregaon Park, Pune',
};

const SALES_PHONE = '+919876543210';

// ─── Pressable button ──────────────────────────────────────

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

// ─── Immersive video viewer modal ──────────────────────────

function ImmersiveVideoViewer({
  visible,
  onClose,
  videoUrl,
  thumbnailUrl,
}: {
  visible: boolean;
  onClose: () => void;
  videoUrl: string;
  thumbnailUrl: string;
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const videoRef = useRef<Video>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const translateY = useSharedValue(0);
  const backdropOpacity = useSharedValue(1);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPaused) {
      await videoRef.current.playAsync();
    } else {
      await videoRef.current.pauseAsync();
    }
    setIsPaused(!isPaused);
  }, [isPaused]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoaded(true);
      if (status.durationMillis && status.durationMillis > 0) {
        setProgress(status.positionMillis / status.durationMillis);
      }
    }
  }, []);

  const dismissGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
        backdropOpacity.value = interpolate(
          e.translationY,
          [0, screenHeight * 0.4],
          [1, 0.2],
          Extrapolation.CLAMP,
        );
      }
    })
    .onEnd((e) => {
      if (e.translationY > 150 || e.velocityY > 800) {
        translateY.value = withTiming(screenHeight, { duration: 250 });
        backdropOpacity.value = withTiming(0, { duration: 250 });
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
        backdropOpacity.value = withSpring(1, { damping: 20 });
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
      backdropOpacity.value = 1;
      setIsLoaded(false);
      setIsPaused(false);
      setProgress(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.View
        style={[
          { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
          backdropStyle,
        ]}
      />

      <GestureDetector gesture={dismissGesture}>
        <Animated.View style={[{ flex: 1 }, containerStyle]}>
          <Pressable onPress={togglePlayPause} style={StyleSheet.absoluteFill}>
            {!isLoaded && (
              <View style={StyleSheet.absoluteFill}>
                <Image
                  source={{ uri: thumbnailUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                <View style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(0,0,0,0.35)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <View style={{
                    width: 56, height: 56, borderRadius: 28,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
                  }}>
                    <Play size={24} color="#fff" fill="#fff" />
                  </View>
                </View>
              </View>
            )}

            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              style={{ width: screenWidth, height: screenHeight }}
              resizeMode={ResizeMode.COVER}
              shouldPlay={visible && !isPaused}
              isLooping
              isMuted={isMuted}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              posterSource={{ uri: thumbnailUrl }}
              usePoster={!isLoaded}
            />

            {isPaused && isLoaded && (
              <View style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'rgba(0,0,0,0.3)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <View style={{
                  width: 72, height: 72, borderRadius: 36,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  justifyContent: 'center', alignItems: 'center',
                  borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
                }}>
                  <Play size={30} color="#fff" fill="#fff" />
                </View>
              </View>
            )}
          </Pressable>

          {/* Progress bar */}
          <View style={{
            position: 'absolute',
            top: insets.top + 4,
            left: 16, right: 16,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: 'rgba(255,255,255,0.2)',
            overflow: 'hidden',
          }}>
            <View style={{
              height: 3,
              borderRadius: 1.5,
              backgroundColor: colors.white,
              width: `${progress * 100}%`,
            }} />
          </View>

          {/* Top gradient */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: insets.top + 90,
            }}
            pointerEvents="none"
          />

          {/* Top controls */}
          <View style={{
            position: 'absolute',
            top: insets.top + 14,
            left: 0, right: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingHorizontal: 12, paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: 'rgba(20, 122, 120, 0.85)',
            }}>
              <Film size={12} color="white" />
              <Text style={{
                fontFamily: fontFamilies.headingSemibold,
                fontSize: 10, color: '#fff', letterSpacing: 0.8,
              }}>AI PROPERTY TOUR</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable
                onPress={toggleMute}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  justifyContent: 'center', alignItems: 'center',
                }}
                hitSlop={8}
              >
                {isMuted ? <VolumeX size={16} color="white" /> : <Volume2 size={16} color="white" />}
              </Pressable>
              <Pressable
                onPress={handleClose}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  justifyContent: 'center', alignItems: 'center',
                }}
                hitSlop={8}
              >
                <X size={18} color="white" />
              </Pressable>
            </View>
          </View>

          {/* Bottom gradient with property info */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.92)']}
            locations={[0, 0.35, 1]}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: screenHeight * 0.32,
              justifyContent: 'flex-end',
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 24,
            }}
            pointerEvents="none"
          >
            <View style={{
              alignSelf: 'flex-start',
              flexDirection: 'row', alignItems: 'center', gap: 5,
              backgroundColor: 'rgba(20, 122, 120, 0.85)',
              paddingHorizontal: 10, paddingVertical: 5,
              borderRadius: 8, marginBottom: 10,
            }}>
              <Zap size={10} color="#fff" fill="#fff" />
              <Text style={{
                fontFamily: fontFamilies.headingSemibold,
                fontSize: 10, color: '#fff', letterSpacing: 0.5,
              }}>AI GENERATED</Text>
            </View>

            <Text style={{
              fontFamily: fontFamilies.headingExtrabold,
              fontSize: fontSizes['2xl'], lineHeight: lineHeights['2xl'],
              color: '#fff', marginBottom: 6,
            }}>Spacious 3BHK Apartment</Text>

            <Text style={{
              fontFamily: fontFamilies.body,
              fontSize: fontSizes.sm, lineHeight: lineHeights.base,
              color: 'rgba(255,255,255,0.75)', marginBottom: 12,
            }}>Koregaon Park, Pune • 1200 sq.ft • ₹45L</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Eye size={13} color="rgba(255,255,255,0.6)" />
                <Text style={{
                  fontFamily: fontFamilies.bodyMedium,
                  fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.6)',
                }}>Property Tour</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Clock size={13} color="rgba(255,255,255,0.6)" />
                <Text style={{
                  fontFamily: fontFamilies.bodyMedium,
                  fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.6)',
                }}>0:15</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Drag indicator */}
          <View style={{
            position: 'absolute', bottom: insets.bottom + 8,
            alignSelf: 'center', width: 36, height: 4, borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.3)',
          }} pointerEvents="none" />
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}

// ─── Upgrade modal ──────────────────────────────────────────

function UpgradeModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const handleContactSales = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${SALES_PHONE}`);
  }, []);

  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <Pressable
        style={um.backdrop}
        onPress={handleDismiss}
      >
        <Pressable style={um.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Close button */}
          <Pressable onPress={handleDismiss} hitSlop={12} style={um.closeBtn}>
            <X size={18} color={colors.neutral[400]} />
          </Pressable>

          {/* Icon */}
          <View style={um.iconWrap}>
            <LinearGradient
              colors={[colors.primary[500], colors.primary[700]]}
              style={um.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Zap size={24} color={colors.white} fill={colors.white} />
            </LinearGradient>
          </View>

          {/* Title & subtitle */}
          <Text style={um.title}>Free Generation Used</Text>
          <Text style={um.subtitle}>
            You've used your complimentary AI video generation. Upgrade to create unlimited video tours for all your listings.
          </Text>

          {/* Usage indicator */}
          <View style={um.usageCard}>
            <View style={um.usageRow}>
              <View style={um.usageItem}>
                <Text style={um.usageNumber}>1/1</Text>
                <Text style={um.usageLabel}>Used</Text>
              </View>
              <View style={um.usageDivider} />
              <View style={um.usageItem}>
                <Text style={[um.usageNumber, { color: colors.neutral[300] }]}>0</Text>
                <Text style={um.usageLabel}>Remaining</Text>
              </View>
            </View>
            {/* Full progress bar */}
            <View style={um.progressBg}>
              <View style={um.progressFill} />
            </View>
          </View>

          {/* Benefits */}
          <View style={um.benefitsSection}>
            <View style={um.benefitsHeader}>
              <Sparkles size={14} color={colors.primary[600]} />
              <Text style={um.benefitsTitle}>Unlock Premium Video Tours</Text>
            </View>
            <View style={um.benefitsList}>
              <UpgradeBenefitRow
                icon={<Film size={14} color={colors.primary[600]} />}
                text="Unlimited AI video generations"
              />
              <UpgradeBenefitRow
                icon={<Zap size={14} color={colors.primary[600]} />}
                text="Priority processing — videos ready faster"
              />
              <UpgradeBenefitRow
                icon={<Headphones size={14} color={colors.primary[600]} />}
                text="Dedicated support team"
              />
            </View>
          </View>

          {/* CTA buttons */}
          <PressableButton onPress={handleContactSales} style={um.ctaBtnOuter}>
            <LinearGradient
              colors={[colors.primary[600], colors.primary[800]]}
              style={um.ctaBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Phone size={16} color={colors.white} />
              <Text style={um.ctaBtnText}>Contact Sales</Text>
            </LinearGradient>
          </PressableButton>

          <Pressable onPress={handleDismiss} style={um.laterBtn}>
            <Text style={um.laterBtnText}>Maybe Later</Text>
          </Pressable>

          <Text style={um.footerNote}>
            Our team will help you find the right plan for your needs
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function UpgradeBenefitRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={um.benefitRow}>
      <View style={um.benefitIcon}>{icon}</View>
      <Text style={um.benefitText}>{text}</Text>
    </View>
  );
}

const um = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
      },
      android: { elevation: 12 },
    }),
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamilies.headingExtrabold,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.base,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: 20,
  },
  usageCard: {
    width: '100%',
    backgroundColor: colors.neutral[50],
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usageItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  usageNumber: {
    fontFamily: fontFamilies.headingExtrabold,
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights['2xl'],
    color: colors.primary[600],
  },
  usageLabel: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[500],
  },
  usageDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.neutral[200],
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[500],
    width: '100%',
  },
  benefitsSection: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitsTitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[900],
  },
  benefitsList: {
    gap: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[700],
  },
  ctaBtnOuter: {
    width: '100%',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    gap: 8,
  },
  ctaBtnText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.white,
    letterSpacing: 0.3,
  },
  laterBtn: {
    paddingVertical: 14,
  },
  laterBtnText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
  },
  footerNote: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[400],
    textAlign: 'center',
  },
});

// ─── Main screen ───────────────────────────────────────────

export default function VideoManagementScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ listingId?: string }>();

  const [showImmersive, setShowImmersive] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handlePlayFullscreen = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowImmersive(true);
  }, []);

  const handleAttach = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/listing/preview?withImages=1&videoAttached=1');
  }, [router]);

  const handleRegenerate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowUpgrade(true);
  }, []);

  const handleDownload = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setToastVisible(true);
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backButton}>
          <ArrowLeft size={22} color={colors.neutral[800]} strokeWidth={2} />
        </Pressable>
        <Text style={s.headerTitle}>AI Video Tour</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={s.scrollView}
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: 170 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Video card */}
        <Animated.View entering={FadeIn.duration(400)} style={s.videoCard}>
          {/* Thumbnail */}
          <Pressable onPress={handlePlayFullscreen} style={s.videoThumbnailContainer}>
            <Image
              source={{ uri: MOCK_VIDEO.thumbnailUrl }}
              style={s.videoThumbnail}
            />
            {/* Dark overlay */}
            <View style={s.playOverlay}>
              <View style={s.playBtn}>
                <Play size={24} color="#fff" fill="#fff" />
              </View>
            </View>

            {/* Duration pill */}
            <View style={s.durationBadge}>
              <Clock size={10} color={colors.primary[100]} />
              <Text style={s.durationText}>{MOCK_VIDEO.duration}</Text>
            </View>

            {/* Ready chip */}
            <View style={s.readyChip}>
              <CheckCircle2 size={12} color={colors.white} fill={colors.white} />
              <Text style={s.readyChipText}>Ready</Text>
            </View>
          </Pressable>

          {/* Info section */}
          <View style={s.videoInfo}>
            <View style={s.videoInfoTop}>
              <View style={s.videoInfoLeft}>
                <Text style={s.videoPropertyName}>{MOCK_VIDEO.propertyTitle}</Text>
                <View style={s.videoLocationRow}>
                  <MapPin size={10} color={colors.neutral[400]} />
                  <Text style={s.videoLocationText}>{MOCK_VIDEO.location}</Text>
                  <View style={s.infoDot} />
                  <Text style={s.videoTimeText}>Generated {MOCK_VIDEO.generatedAt}</Text>
                </View>
              </View>
            </View>

            {/* Action row */}
            <View style={s.actionRow}>
              <Pressable onPress={handleDownload} hitSlop={8} style={s.actionBtn}>
                <Download size={14} color={colors.neutral[600]} />
                <Text style={s.actionBtnText}>Save</Text>
              </Pressable>
              <View style={s.actionDivider} />
              <Pressable onPress={handlePlayFullscreen} hitSlop={8} style={s.actionBtn}>
                <Maximize2 size={14} color={colors.neutral[600]} />
                <Text style={s.actionBtnText}>Fullscreen</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Benefits card */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)} style={s.benefitsCard}>
          <Text style={s.benefitsTitle}>Videos boost your listing</Text>
          <View style={s.benefitsList}>
            <BenefitRow text="3x more views and inquiries" />
            <BenefitRow text="Higher search ranking with video content" />
            <BenefitRow text="Stand out from 95% of listings" />
          </View>
        </Animated.View>

      </ScrollView>

      {/* Bottom bar */}
      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <PressableButton onPress={handleRegenerate} style={s.secondaryBtnOuter}>
          <View style={s.secondaryBtn}>
            <RefreshCw size={15} color={colors.primary[700]} />
            <Text style={s.secondaryBtnText}>Regenerate New Video</Text>
          </View>
        </PressableButton>

        <PressableButton onPress={handleAttach} style={s.primaryBtnOuter}>
          <LinearGradient
            colors={[colors.primary[600], colors.primary[800]]}
            style={s.primaryBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Check size={18} color={colors.white} strokeWidth={2.5} />
            <Text style={s.primaryBtnText}>Attach to Listing</Text>
          </LinearGradient>
        </PressableButton>
      </View>

      <ImmersiveVideoViewer
        visible={showImmersive}
        onClose={() => setShowImmersive(false)}
        videoUrl={MOCK_VIDEO.videoUrl}
        thumbnailUrl={MOCK_VIDEO.thumbnailUrl}
      />

      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />

      <Toast
        visible={toastVisible}
        message="Video saved to your device"
        variant="success"
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

// ─── Benefit row ───────────────────────────────────────────

function BenefitRow({ text }: { text: string }) {
  return (
    <View style={s.benefitRow}>
      <Check size={13} color={colors.primary[600]} strokeWidth={2.5} />
      <Text style={s.benefitText}>{text}</Text>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // Header — clean, centered
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },

  // Video card — single white card, standard styling
  videoCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  videoThumbnailContainer: {
    height: 230,
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(20,78,76,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 10,
    color: colors.white,
  },
  readyChip: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  readyChipText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: 10,
    color: colors.white,
    letterSpacing: 0.3,
  },

  // Video info
  videoInfo: {
    padding: 16,
    gap: 14,
  },
  videoInfoTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  videoInfoLeft: {
    flex: 1,
    gap: 4,
  },
  videoPropertyName: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[900],
  },
  videoLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  videoLocationText: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[500],
  },
  infoDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.neutral[300],
  },
  videoTimeText: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[400],
  },

  // Action row — labeled buttons
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral[100],
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionBtnText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[600],
  },
  actionDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.neutral[100],
  },

  // Benefits card — teal tint, concise
  benefitsCard: {
    backgroundColor: colors.primary[50],
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  benefitsTitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[900],
  },
  benefitsList: {
    gap: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.sm,
    color: colors.neutral[700],
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  secondaryBtnOuter: {
    alignSelf: 'stretch',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary[200],
    backgroundColor: colors.white,
    gap: 7,
  },
  secondaryBtnText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.primary[700],
  },
  primaryBtnOuter: {
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
});
