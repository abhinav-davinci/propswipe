import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { MapPin, Bed, Maximize2, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { colors } from '../../src/theme/colors';

function BlurredPropertyCard({ index, matchScore, title, area, price, beds, sqft }: {
  index: number;
  matchScore: number;
  title: string;
  area: string;
  price: string;
  beds: number;
  sqft: number;
}) {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(index * 200, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
    opacity.value = withDelay(index * 200, withTiming(1, { duration: 600 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle} className="mb-3">
      <View className="bg-white rounded-xl overflow-hidden border border-neutral-100"
        style={{ shadowColor: '#094E4C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
        {/* Image placeholder with blur */}
        <View className="h-32 bg-neutral-200 relative">
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View className="absolute top-3 left-3 bg-primary-600 rounded-md px-2 py-0.5">
            <Text className="text-xs font-heading-semibold text-white">{matchScore}% Match</Text>
          </View>
          <BlurView intensity={40} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        </View>

        <View className="p-3.5">
          <Text className="text-base font-heading-semibold text-neutral-900 mb-0.5">{title}</Text>
          <View className="flex-row items-center mb-2">
            <MapPin size={13} color={colors.neutral[500]} />
            <Text className="text-xs font-body text-neutral-500 ml-1">{area}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-heading-extrabold text-primary-600">{price}</Text>
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center">
                <Bed size={13} color={colors.neutral[500]} />
                <Text className="text-xs font-body text-neutral-500 ml-1">{beds} BHK</Text>
              </View>
              <View className="flex-row items-center">
                <Maximize2 size={13} color={colors.neutral[500]} />
                <Text className="text-xs font-body text-neutral-500 ml-1">{sqft} sqft</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Blur overlay */}
        <BlurView intensity={25} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      </View>
    </Animated.View>
  );
}

function ValueTicker() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(800, withTiming(1, { duration: 600 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const stats = [
    { label: 'Properties', value: '12,400+' },
    { label: 'Matched', value: '94%' },
    { label: 'Areas', value: '32' },
  ];

  return (
    <Animated.View style={animStyle} className="flex-row justify-around py-3 bg-primary-50 rounded-xl mx-6">
      {stats.map((stat, i) => (
        <View key={i} className="items-center">
          <Text className="text-lg font-heading-extrabold text-primary-800">{stat.value}</Text>
          <Text className="text-[11px] font-body text-primary-600">{stat.label}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

export default function GuestPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const enterGuestMode = useAuthStore((s) => s.enterGuestMode);

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header — uses safe area top for proper notch/Dynamic Island clearance */}
      <LinearGradient
        colors={['#094E4C', '#147A78']}
        style={{ paddingTop: insets.top + 16, paddingBottom: 20, paddingHorizontal: 24 }}
      >
        <Text className="text-2xl font-heading-extrabold text-white">
          Find your perfect{'\n'}home in Pune
        </Text>
        <Text className="text-sm font-body text-white/70 mt-2">
          AI-matched properties, just for you
        </Text>
      </LinearGradient>

      {/* Value ticker — no negative margin, sits naturally below header */}
      <View style={{ marginTop: -14 }}>
        <ValueTicker />
      </View>

      {/* Blurred preview cards */}
      <ScrollView className="flex-1 px-6 mt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-xs font-heading-semibold text-neutral-500 mb-3 uppercase tracking-wider">
          Preview Matches
        </Text>
        <BlurredPropertyCard
          index={0}
          matchScore={94}
          title="Luxury 3BHK in BluRidge"
          area="Hinjewadi, Phase 1"
          price="₹1.25 Cr"
          beds={3}
          sqft={1405}
        />
        <BlurredPropertyCard
          index={1}
          matchScore={87}
          title="Modern 2BHK Amanora"
          area="Hadapsar"
          price="₹85 L"
          beds={2}
          sqft={924}
        />
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 gap-2" style={{ paddingBottom: insets.bottom + 12 }}>
        <Pressable
          onPress={() => router.push('/(auth)/sign-in')}
          className="bg-primary-600 py-4 rounded-xl items-center flex-row justify-center"
          style={{ shadowColor: '#094E4C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
        >
          <Text className="text-base font-heading-semibold text-white mr-2">Get Started</Text>
          <ArrowRight size={18} color="white" />
        </Pressable>

        <Pressable
          onPress={() => {
            enterGuestMode();
            router.replace('/(tabs)/discover');
          }}
          className="py-3 items-center"
        >
          <Text className="text-sm font-body-medium text-neutral-500">
            Continue as Guest
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
