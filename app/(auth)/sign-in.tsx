import React, { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Phone, Mail } from 'lucide-react-native';
import { TextInput } from '../../src/components/ui/TextInput';
import { Button } from '../../src/components/ui/Button';
import { colors } from '../../src/theme/colors';

export default function SignInScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSendOTP = () => {
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    router.push({ pathname: '/(auth)/otp-verify', params: { phone } });
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header with gradient */}
      <LinearGradient
        colors={['#094E4C', '#147A78']}
        className="pt-16 pb-10 px-6"
      >
        <Pressable onPress={() => router.back()} className="mb-6">
          <ChevronLeft size={24} color="white" />
        </Pressable>
        <Text className="text-3xl font-heading-extrabold text-white">
          Welcome to{'\n'}PropSwipe
        </Text>
        <Text className="text-sm font-body text-white/70 mt-2">
          Sign in to unlock personalised matches
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-8">
          {/* Phone input */}
          <Text className="text-lg font-heading-semibold text-neutral-900 mb-4">
            Enter your mobile number
          </Text>

          <View className="flex-row items-start gap-3">
            <View className="bg-white border border-neutral-200 rounded-md px-4 py-3.5 items-center justify-center">
              <Text className="text-base font-body-medium text-neutral-700">+91</Text>
            </View>
            <View className="flex-1">
              <TextInput
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  if (error) setError('');
                }}
                error={error}
                icon={<Phone size={18} color={colors.neutral[400]} />}
              />
            </View>
          </View>

          <Button
            title="Send OTP"
            onPress={handleSendOTP}
            fullWidth
            className="mt-6"
          />

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-neutral-200" />
            <Text className="text-sm font-body text-neutral-400 mx-4">or continue with</Text>
            <View className="flex-1 h-px bg-neutral-200" />
          </View>

          {/* Social login buttons */}
          <View className="gap-3">
            <Pressable
              onPress={() => {
                // Mock Google sign-in
                router.push({ pathname: '/(auth)/otp-verify', params: { phone: '9876543210' } });
              }}
              className="flex-row items-center justify-center bg-white border border-neutral-200 rounded-md py-3.5 px-4"
            >
              <View className="w-5 h-5 bg-red-500 rounded-full mr-3 items-center justify-center">
                <Text className="text-xs font-heading text-white">G</Text>
              </View>
              <Text className="text-base font-body-medium text-neutral-700">Continue with Google</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                router.push({ pathname: '/(auth)/otp-verify', params: { phone: '9876543210' } });
              }}
              className="flex-row items-center justify-center bg-black rounded-md py-3.5 px-4"
            >
              <Text className="text-base font-heading text-white mr-2">&#63743;</Text>
              <Text className="text-base font-body-medium text-white">Continue with Apple</Text>
            </Pressable>
          </View>

          {/* Terms */}
          <Text className="text-xs font-body text-neutral-400 text-center mt-8 px-4">
            By continuing, you agree to PropSwipe's{' '}
            <Text className="text-primary-600">Terms of Service</Text> and{' '}
            <Text className="text-primary-600">Privacy Policy</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
