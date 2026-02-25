import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const matchSteps = [
  'Scanning 12,400+ properties...',
  'Matching your preferences...',
  'Analyzing neighbourhoods...',
  'Calculating match scores...',
  'Your matches are ready!',
];

export default function MatchAnimationScreen() {
  const router = useRouter();
  const { completeOnboarding, setCurrentStep } = useOnboardingStore();
  const [stepIndex, setStepIndex] = useState(0);

  // Animated values
  const ringScale = useSharedValue(0.5);
  const ringOpacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0.5);
  const ring2Opacity = useSharedValue(0);
  const counterValue = useSharedValue(0);
  const textOpacity = useSharedValue(1);

  useEffect(() => {
    setCurrentStep(3);

    // Pulsing rings
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.cubic) }),
        withTiming(0.5, { duration: 0 })
      ),
      -1
    );
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1500 }),
        withTiming(0.6, { duration: 0 })
      ),
      -1
    );
    ring2Scale.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.cubic) }),
          withTiming(0.5, { duration: 0 })
        ),
        -1
      )
    );
    ring2Opacity.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 1500 }),
          withTiming(0.4, { duration: 0 })
        ),
        -1
      )
    );

    // Step through messages
    const intervals = [800, 1200, 1000, 1200, 800];
    let totalDelay = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    intervals.forEach((delay, i) => {
      totalDelay += delay;
      const timer = setTimeout(() => {
        setStepIndex(i);
        if (i < intervals.length - 1) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }, totalDelay);
      timers.push(timer);
    });

    // Complete and navigate
    const finalTimer = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      completeOnboarding();
      router.replace('/(tabs)/discover');
    }, totalDelay + 1500);
    timers.push(finalTimer);

    return () => timers.forEach(clearTimeout);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  return (
    <LinearGradient
      colors={['#1A8F8C', '#E8960F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Pulsing rings */}
        <View className="items-center justify-center mb-12">
          <Animated.View
            style={ringStyle}
            className="absolute w-48 h-48 rounded-full border-2 border-white/30"
          />
          <Animated.View
            style={ring2Style}
            className="absolute w-48 h-48 rounded-full border border-white/20"
          />
          <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center">
            <Text className="text-3xl font-heading-extrabold text-white">P</Text>
          </View>
        </View>

        {/* Step text */}
        <Text className="text-xl font-heading text-white text-center mb-4">
          {matchSteps[stepIndex]}
        </Text>

        {/* Progress dots */}
        <View className="flex-row gap-2 mt-4">
          {matchSteps.map((_, i) => (
            <View
              key={i}
              className={`w-2 h-2 rounded-full ${
                i <= stepIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}
