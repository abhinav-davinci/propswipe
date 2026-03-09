import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Video as VideoIcon,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import type { VideoReel } from '../../types/insight';

const categoryLabels: Record<string, string> = {
  explainer: 'EXPLAINER',
  market_update: 'MARKET UPDATE',
  property_tour: 'PROPERTY TOUR',
  tips: 'TIPS',
};

const categoryColors: Record<string, string> = {
  explainer: '#0284C7',
  market_update: '#147A78',
  property_tour: '#E8960F',
  tips: '#7C3AED',
};

interface ImmersiveReelViewerProps {
  reel: VideoReel;
  visible: boolean;
  onClose: () => void;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function ImmersiveReelViewer({
  reel,
  visible,
  onClose,
  onSwipeNext,
  onSwipePrev,
  hasNext,
  hasPrev,
}: ImmersiveReelViewerProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const videoRef = useRef<Video>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const catColor = categoryColors[reel.category] ?? '#147A78';

  // Animation values
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const backdropOpacity = useSharedValue(1);
  const videoScale = useSharedValue(1);
  const captionHeight = useSharedValue(0);

  // Reset state when reel changes
  useEffect(() => {
    setCaptionExpanded(false);
    setIsLoaded(false);
    videoScale.value = withTiming(1, { duration: 300 });
    translateX.value = 0;
    translateY.value = 0;
    backdropOpacity.value = 1;
  }, [reel.id]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (!hasNext) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSwipeNext();
  }, [hasNext, onSwipeNext]);

  const handlePrev = useCallback(() => {
    if (!hasPrev) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSwipePrev();
  }, [hasPrev, onSwipePrev]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoaded(true);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const toggleCaption = useCallback(() => {
    const next = !captionExpanded;
    setCaptionExpanded(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Video shrinks when captions expand, grows back when collapsed
    videoScale.value = withSpring(next ? 0.82 : 1, {
      damping: 18,
      stiffness: 140,
    });
  }, [captionExpanded, videoScale]);

  // ── Drag-down-to-dismiss gesture ──
  const dismissGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow downward drag for dismiss
      if (e.translationY > 0) {
        translateY.value = e.translationY;
        backdropOpacity.value = interpolate(
          e.translationY,
          [0, screenHeight * 0.4],
          [1, 0.2],
          Extrapolation.CLAMP
        );
      }
    })
    .onEnd((e) => {
      if (e.translationY > 150 || e.velocityY > 800) {
        // Dismiss
        translateY.value = withTiming(screenHeight, { duration: 250 });
        backdropOpacity.value = withTiming(0, { duration: 250 });
        runOnJS(handleClose)();
      } else {
        // Snap back
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
        backdropOpacity.value = withSpring(1, { damping: 20 });
      }
    });

  // ── Swipe left/right for next/prev ──
  const horizontalGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const threshold = screenWidth * 0.25;
      if (e.translationX < -threshold || e.velocityX < -600) {
        // Swipe left → next
        translateX.value = withTiming(-screenWidth, { duration: 200 });
        runOnJS(handleNext)();
      } else if (e.translationX > threshold || e.velocityX > 600) {
        // Swipe right → prev
        translateX.value = withTiming(screenWidth, { duration: 200 });
        runOnJS(handlePrev)();
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const combinedGesture = Gesture.Race(horizontalGesture, dismissGesture);

  // ── Animated styles ──
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const videoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: videoScale.value }],
  }));

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

      {/* Dark backdrop */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000',
          },
          backdropStyle,
        ]}
      />

      <GestureDetector gesture={combinedGesture}>
        <Animated.View
          style={[
            {
              flex: 1,
              backgroundColor: 'transparent',
            },
            containerStyle,
          ]}
        >
          {/* Video area */}
          <Animated.View
            style={[
              {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              },
              videoAnimStyle,
            ]}
          >
            {/* Thumbnail fallback */}
            {!isLoaded && (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                <Image
                  source={{ uri: reel.thumbnailUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: 999,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}
                  >
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>
                      LOADING
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Full-screen video */}
            <Video
              ref={videoRef}
              source={{ uri: reel.videoUrl }}
              style={{
                width: screenWidth,
                height: screenHeight,
              }}
              resizeMode={ResizeMode.COVER}
              shouldPlay={visible}
              isLooping
              isMuted={isMuted}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              posterSource={{ uri: reel.thumbnailUrl }}
              usePoster={!isLoaded}
            />
          </Animated.View>

          {/* Top gradient */}
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: insets.top + 80,
            }}
            pointerEvents="none"
          />

          {/* Top controls */}
          <View
            style={{
              position: 'absolute',
              top: insets.top + 8,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
            }}
          >
            {/* Category badge */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: catColor,
              }}
            >
              <VideoIcon size={12} color="white" />
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 1 }}>
                {categoryLabels[reel.category] ?? 'VIDEO'}
              </Text>
            </View>

            {/* Right controls */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* Duration */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Clock size={11} color="white" />
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>
                  {reel.duration}
                </Text>
              </View>

              {/* Mute toggle */}
              <Pressable
                onPress={toggleMute}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                hitSlop={8}
              >
                {isMuted ? <VolumeX size={16} color="white" /> : <Volume2 size={16} color="white" />}
              </Pressable>

              {/* Close button */}
              <Pressable
                onPress={handleClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                hitSlop={8}
              >
                <X size={18} color="white" />
              </Pressable>
            </View>
          </View>

          {/* Bottom gradient */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.92)']}
            locations={[0, 0.3, 1]}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: captionExpanded ? screenHeight * 0.55 : screenHeight * 0.35,
            }}
            pointerEvents="none"
          />

          {/* Caption area */}
          <Pressable
            onPress={toggleCaption}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: 20,
            }}
          >
            {/* Drag indicator */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.4)',
                }}
              />
            </View>

            {/* Source */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: catColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Eye size={11} color="white" />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: 0.5,
                }}
              >
                {reel.source}
              </Text>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: '#fff',
                lineHeight: 28,
                marginBottom: 8,
              }}
              numberOfLines={captionExpanded ? undefined : 2}
            >
              {reel.title}
            </Text>

            {/* Description */}
            {captionExpanded ? (
              <Animated.View entering={FadeIn.duration(250)}>
                <ScrollView
                  style={{ maxHeight: screenHeight * 0.3 }}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: 'rgba(255,255,255,0.85)',
                      lineHeight: 22,
                      marginBottom: 16,
                    }}
                  >
                    {reel.description}
                  </Text>
                </ScrollView>

                {/* Collapse hint */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <ChevronDown size={14} color="rgba(255,255,255,0.5)" />
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    Tap to collapse
                  </Text>
                </View>
              </Animated.View>
            ) : (
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 20,
                  }}
                  numberOfLines={1}
                >
                  {reel.description}
                </Text>

                {/* Expand hint */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  <ChevronUp size={14} color="rgba(255,255,255,0.5)" />
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    Tap for more
                  </Text>
                </View>
              </View>
            )}
          </Pressable>

          {/* Swipe navigation hints */}
          {!captionExpanded && (
            <>
              {hasPrev && (
                <View
                  style={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    marginTop: -20,
                    width: 4,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  }}
                  pointerEvents="none"
                />
              )}
              {hasNext && (
                <View
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    marginTop: -20,
                    width: 4,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  }}
                  pointerEvents="none"
                />
              )}
            </>
          )}
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}
