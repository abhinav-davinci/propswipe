import React, { useRef, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Video as VideoIcon, Volume2, VolumeX, Eye } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { useScreenLayout } from '../../hooks/useScreenLayout';
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

interface VideoReelCardProps {
  reel: VideoReel;
}

export function VideoReelCard({ reel }: VideoReelCardProps) {
  const { cardWidth, cardMaxHeight, isSmallDevice } = useScreenLayout();
  const videoRef = useRef<Video>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  const catColor = categoryColors[reel.category] ?? colors.primary[600];

  // Pulsing "LIVE" dot animation for the category badge
  const pulseAnim = useSharedValue(1);
  React.useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseAnim.value }));

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoaded(true);
      setIsBuffering(status.isBuffering);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m);
  }, []);

  // Full card height for immersive feel
  const cardHeight = cardMaxHeight;

  return (
    <View
      className="rounded-2xl overflow-hidden"
      style={{
        width: cardWidth,
        height: cardHeight,
        backgroundColor: '#0A0A0A',
      }}
    >
      {/* Poster / fallback thumbnail */}
      {!isLoaded && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Image
            source={{ uri: reel.thumbnailUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
          />
          {/* Loading shimmer overlay */}
          <View
            className="absolute inset-0 items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
          >
            <Animated.View
              entering={FadeIn.duration(400)}
              className="flex-row items-center gap-2 bg-black/50 rounded-full px-4 py-2"
            >
              <View className="w-2 h-2 rounded-full bg-white" />
              <Text className="text-white text-xs font-heading-semibold tracking-wider">
                LOADING
              </Text>
            </Animated.View>
          </View>
        </View>
      )}

      {/* Autoplay video */}
      <Video
        ref={videoRef}
        source={{ uri: reel.videoUrl }}
        style={{ width: '100%', height: '100%' }}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted={isMuted}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        posterSource={{ uri: reel.thumbnailUrl }}
        usePoster={!isLoaded}
      />

      {/* Top gradient for badges */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.0)']}
        locations={[0, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 100,
        }}
      />

      {/* Bottom gradient for text content */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.88)']}
        locations={[0, 0.4, 1]}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: cardHeight * 0.5,
        }}
      />

      {/* Top-left: Category badge with live dot */}
      <View className="absolute top-4 left-4 flex-row items-center gap-2">
        <View
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: catColor }}
        >
          <Animated.View
            style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' }, pulseStyle]}
          />
          <VideoIcon size={12} color="white" />
          <Text className="text-xs font-heading-bold text-white tracking-wider">
            {categoryLabels[reel.category] ?? 'VIDEO'}
          </Text>
        </View>
      </View>

      {/* Top-right: Duration + mute toggle */}
      <View className="absolute top-4 right-4 flex-row items-center gap-2">
        <View className="flex-row items-center bg-black/50 rounded-full px-2.5 py-1.5 gap-1">
          <Clock size={11} color="white" />
          <Text className="text-xs font-heading-semibold text-white">{reel.duration}</Text>
        </View>
        <Pressable
          onPress={toggleMute}
          className="items-center justify-center bg-black/50 rounded-full"
          style={{ width: 32, height: 32 }}
          hitSlop={8}
        >
          {isMuted ? (
            <VolumeX size={15} color="white" />
          ) : (
            <Volume2 size={15} color="white" />
          )}
        </Pressable>
      </View>

      {/* Bottom content overlay */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-5">
        {/* Source */}
        <View className="flex-row items-center gap-1.5 mb-2">
          <View className="w-5 h-5 rounded-full bg-primary-500 items-center justify-center">
            <Eye size={10} color="white" />
          </View>
          <Text className="text-xs font-heading-semibold text-white/70 tracking-wide">
            {reel.source}
          </Text>
        </View>

        {/* Title */}
        <Text
          className={`${isSmallDevice ? 'text-xl' : 'text-2xl'} font-heading-extrabold text-white leading-tight mb-2`}
          numberOfLines={2}
        >
          {reel.title}
        </Text>

        {/* Description */}
        <Text
          className="text-sm font-body text-white/75 leading-relaxed"
          numberOfLines={isSmallDevice ? 2 : 3}
        >
          {reel.description}
        </Text>
      </View>
    </View>
  );
}
