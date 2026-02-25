import React, { useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { User } from 'lucide-react-native';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { TextInput } from '../../src/components/ui/TextInput';
import { Button } from '../../src/components/ui/Button';
import { colors } from '../../src/theme/colors';

export default function NameScreen() {
  const router = useRouter();
  const { name, setName, setCurrentStep } = useOnboardingStore();

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const inputOpacity = useSharedValue(0);

  useEffect(() => {
    setCurrentStep(0);
    titleOpacity.value = withTiming(1, { duration: 500 });
    titleY.value = withTiming(0, { duration: 500 });
    inputOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const inputStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-neutral-50"
    >
      <View className="flex-1 px-6 pt-8">
        <Animated.View style={titleStyle}>
          <Text className="text-3xl font-heading-extrabold text-neutral-900 mb-2">
            What should we{'\n'}call you?
          </Text>
          <Text className="text-base font-body text-neutral-500 mb-8">
            This helps us personalise your experience
          </Text>
        </Animated.View>

        <Animated.View style={inputStyle}>
          <TextInput
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoFocus
            icon={<User size={18} color={colors.neutral[400]} />}
            containerClassName="mb-6"
          />
        </Animated.View>
      </View>

      <View className="px-6 pb-10">
        <Button
          title="Continue"
          onPress={() => router.push('/(onboarding)/intent')}
          disabled={name.trim().length < 2}
          fullWidth
          size="lg"
        />
      </View>
    </KeyboardAvoidingView>
  );
}
