import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput as RNTextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/stores/authStore';
import { colors } from '../../src/theme/colors';

const OTP_LENGTH = 6;

export default function OTPVerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const signIn = useAuthStore((s) => s.signIn);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const inputs = useRef<(RNTextInput | null)[]>([]);

  useEffect(() => {
    // Focus first input
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError('');

    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (text && index === OTP_LENGTH - 1) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === OTP_LENGTH) {
        verifyOTP(fullOtp);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const verifyOTP = async (code: string) => {
    setVerifying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Accept any 6-digit code for mock
    signIn(
      {
        id: 'u1',
        name: '',
        phone: phone ?? '9876543210',
        createdAt: new Date().toISOString(),
      },
      'mock-token-xyz'
    );

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(onboarding)/name');
  };

  const resendOTP = () => {
    setTimer(30);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputs.current[0]?.focus();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const maskedPhone = phone
    ? `+91 ${phone.slice(0, 2)}****${phone.slice(-2)}`
    : '+91 98****10';

  return (
    <View className="flex-1 bg-neutral-50">
      <LinearGradient
        colors={['#094E4C', '#147A78']}
        className="pt-16 pb-10 px-6"
      >
        <Pressable onPress={() => router.back()} className="mb-6">
          <ChevronLeft size={24} color="white" />
        </Pressable>
        <Text className="text-3xl font-heading-extrabold text-white">
          Verify OTP
        </Text>
        <Text className="text-sm font-body text-white/70 mt-2">
          We've sent a 6-digit code to {maskedPhone}
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-8">
          {/* OTP Input cells */}
          <View className="flex-row justify-between mb-4">
            {otp.map((digit, index) => (
              <RNTextInput
                key={index}
                ref={(ref) => { inputs.current[index] = ref; }}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                className={`w-12 h-14 text-center text-xl font-heading bg-white border rounded-md ${
                  digit
                    ? 'border-primary-600 bg-primary-50'
                    : error
                    ? 'border-error'
                    : 'border-neutral-200'
                }`}
                style={{ color: colors.neutral[900] }}
              />
            ))}
          </View>

          {error ? (
            <Text className="text-sm text-error font-body mb-4">{error}</Text>
          ) : null}

          {verifying && (
            <Text className="text-sm text-primary-600 font-body-medium mb-4">
              Verifying...
            </Text>
          )}

          {/* Resend */}
          <View className="flex-row items-center mt-4">
            <Text className="text-sm font-body text-neutral-500">
              Didn't receive the code?{' '}
            </Text>
            {timer > 0 ? (
              <Text className="text-sm font-body-medium text-neutral-400">
                Resend in {timer}s
              </Text>
            ) : (
              <Pressable onPress={resendOTP}>
                <Text className="text-sm font-heading-semibold text-primary-600">
                  Resend OTP
                </Text>
              </Pressable>
            )}
          </View>

          {/* Tip */}
          <View className="mt-8 p-4 bg-primary-50 rounded-md">
            <Text className="text-xs font-body text-primary-800">
              Tip: For this demo, enter any 6 digits to verify.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
