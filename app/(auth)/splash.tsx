import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);

  useEffect(() => {
    // Animate logo
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) });
    logoOpacity.value = withTiming(1, { duration: 600 });

    // Animate tagline
    taglineOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    taglineTranslateY.value = withDelay(500, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));

    // Navigate after animation
    const timer = setTimeout(() => {
      router.replace('/(auth)/guest-preview');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  return (
    <LinearGradient
      colors={['#147A78', '#094E4C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View className="flex-1 items-center justify-center">
        <Animated.View style={logoStyle} className="items-center">
          <View className="w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-6">
            <Text className="text-4xl font-heading-extrabold text-white">P</Text>
          </View>
          <Text className="text-4xl font-heading-extrabold text-white tracking-tight">
            PropSwipe
          </Text>
        </Animated.View>

        <Animated.View style={taglineStyle} className="mt-4">
          <Text className="text-base font-body text-white/80 text-center">
            Swipe. Match. Move In.
          </Text>
        </Animated.View>
      </View>

      {/* Bottom decoration */}
      <View className="absolute bottom-12 left-0 right-0 items-center">
        <View className="w-12 h-1 bg-white/20 rounded-full" />
      </View>
    </LinearGradient>
  );
}
