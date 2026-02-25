import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import type { SwipeDirection } from '../types/property';

const SWIPE_UP_THRESHOLD = -120;

interface UseSwipeGestureOptions {
  onSwipe: (direction: SwipeDirection) => void;
  onTap?: () => void;
}

export function useSwipeGesture({ onSwipe, onTap }: UseSwipeGestureOptions) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const swipeThreshold = screenWidth * 0.3;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const resetCard = useCallback(() => {
    'worklet';
    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    rotation.value = withSpring(0, { damping: 15, stiffness: 150 });
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  const swipeOff = useCallback(
    (direction: SwipeDirection) => {
      'worklet';
      const targetX =
        direction === 'left'
          ? -screenWidth * 1.5
          : direction === 'right'
          ? screenWidth * 1.5
          : 0;
      const targetY = direction === 'superlike' || direction === 'up' ? -screenHeight : 0;

      translateX.value = withTiming(targetX, { duration: 300 });
      translateY.value = withTiming(targetY, { duration: 300 });

      runOnJS(onSwipe)(direction);
    },
    [onSwipe, screenWidth, screenHeight]
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.02);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = interpolate(
        event.translationX,
        [-screenWidth / 2, 0, screenWidth / 2],
        [-15, 0, 15],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      if (event.translationX > swipeThreshold) {
        swipeOff('right');
      } else if (event.translationX < -swipeThreshold) {
        swipeOff('left');
      } else if (event.translationY < SWIPE_UP_THRESHOLD) {
        swipeOff('superlike');
      } else {
        resetCard();
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    if (onTap) {
      runOnJS(onTap)();
    }
  });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, swipeThreshold], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-swipeThreshold, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const superlikeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [SWIPE_UP_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const programmaticSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (direction === 'left') {
        translateX.value = withTiming(-screenWidth * 1.5, { duration: 400 });
        rotation.value = withTiming(-15, { duration: 400 });
      } else if (direction === 'right') {
        translateX.value = withTiming(screenWidth * 1.5, { duration: 400 });
        rotation.value = withTiming(15, { duration: 400 });
      } else if (direction === 'superlike' || direction === 'up') {
        translateY.value = withTiming(-screenHeight, { duration: 400 });
        scale.value = withTiming(1.1, { duration: 200 });
      }
      setTimeout(() => onSwipe(direction), 400);
    },
    [onSwipe, screenWidth, screenHeight]
  );

  return {
    gesture,
    cardStyle,
    likeOpacity,
    nopeOpacity,
    superlikeOpacity,
    programmaticSwipe,
    translateX,
    translateY,
  };
}
