import React, { useEffect, useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Play, Volume2, VolumeX, Film } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fontFamilies, fontSizes } from '../../theme/typography';
import type { VideoTour } from '../../types/property';

interface VideoSlideProps {
  videoTour: VideoTour;
  width: number;
  height: number;
  isActive: boolean;
  onTapFullscreen?: () => void;
}

export function VideoSlide({ videoTour, width, height, isActive, onTapFullscreen }: VideoSlideProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const controlsOpacity = useSharedValue(1);

  const player = useVideoPlayer(videoTour.url, (p) => {
    p.loop = true;
    p.muted = true;
    p.volume = 1;
  });

  // Auto-play when active, pause when not
  useEffect(() => {
    if (isActive) {
      player.play();
      setIsPlaying(true);
      setHasStarted(true);
      controlsOpacity.value = withTiming(0, { duration: 800 });
    } else {
      player.pause();
      setIsPlaying(false);
      controlsOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [isActive]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    player.muted = newMuted;
  }, [isMuted, player]);

  const handleTap = useCallback(() => {
    if (onTapFullscreen) {
      onTapFullscreen();
      return;
    }
    // Toggle play/pause
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
      controlsOpacity.value = withTiming(1, { duration: 200 });
    } else {
      player.play();
      setIsPlaying(true);
      setHasStarted(true);
      // Auto-hide controls
      controlsOpacity.value = withTiming(0, { duration: 800 });
    }
  }, [isPlaying, player, onTapFullscreen]);

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  const minutes = Math.floor(videoTour.durationSeconds / 60);
  const seconds = videoTour.durationSeconds % 60;
  const durationLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View style={{ width, height, position: 'relative', backgroundColor: '#000' }}>
      {/* Thumbnail shown until video starts playing */}
      {!hasStarted && (
        <Image
          source={{ uri: videoTour.thumbnailUrl }}
          style={[StyleSheet.absoluteFill, { zIndex: 2 }]}
          contentFit="cover"
        />
      )}

      <VideoView
        player={player}
        style={{ width, height }}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Tap area + overlays */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleTap}>
        {/* Play button overlay (when not playing) */}
        {!isPlaying && (
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Play size={28} color={colors.white} fill={colors.white} />
            </View>
          </View>
        )}

        {/* AI Video Tour badge */}
        <View style={styles.videoBadge}>
          <Film size={10} color={colors.white} />
          <Animated.Text style={styles.videoBadgeText}>AI Video Tour</Animated.Text>
        </View>

        {/* Duration pill */}
        <View style={styles.durationPill}>
          <Animated.Text style={styles.durationText}>{durationLabel}</Animated.Text>
        </View>

        {/* Mute toggle */}
        {hasStarted && (
          <Animated.View style={[styles.muteButton, controlsStyle]}>
            <Pressable onPress={toggleMute} hitSlop={8} style={styles.muteButtonInner}>
              {isMuted ? (
                <VolumeX size={16} color={colors.white} />
              ) : (
                <Volume2 size={16} color={colors.white} />
              )}
            </Pressable>
          </Animated.View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  videoBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  videoBadgeText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 10,
    color: colors.white,
  },
  durationPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    color: colors.white,
  },
  muteButton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  muteButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
