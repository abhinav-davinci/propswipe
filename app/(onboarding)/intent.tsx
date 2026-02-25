import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { Building2, Home, MapPin, Crown, Minimize2, Grid3X3 } from 'lucide-react-native';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { Button } from '../../src/components/ui/Button';
import { colors } from '../../src/theme/colors';
import type { PropertyType, TransactionType } from '../../src/types/property';

const propertyTypes: { type: PropertyType; label: string; icon: React.ReactNode }[] = [
  { type: 'apartment', label: 'Apartment', icon: <Building2 size={28} color={colors.primary[600]} /> },
  { type: 'villa', label: 'Villa', icon: <Home size={28} color={colors.primary[600]} /> },
  { type: 'plot', label: 'Plot', icon: <MapPin size={28} color={colors.primary[600]} /> },
  { type: 'penthouse', label: 'Penthouse', icon: <Crown size={28} color={colors.primary[600]} /> },
  { type: 'studio', label: 'Studio', icon: <Minimize2 size={28} color={colors.primary[600]} /> },
  { type: 'rowhouse', label: 'Row House', icon: <Grid3X3 size={28} color={colors.primary[600]} /> },
];

function BuyRentToggle() {
  const { transactionType, setTransactionType } = useOnboardingStore();

  return (
    <View className="flex-row bg-neutral-100 rounded-md p-1">
      {(['buy', 'rent'] as TransactionType[]).map((type) => (
        <Pressable
          key={type}
          onPress={() => setTransactionType(type)}
          className={`flex-1 py-3 rounded-md items-center ${
            transactionType === type ? 'bg-primary-600' : ''
          }`}
        >
          <Text
            className={`text-base font-heading-semibold ${
              transactionType === type ? 'text-white' : 'text-neutral-500'
            }`}
          >
            {type === 'buy' ? 'Buy' : 'Rent'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function IntentGrid() {
  const { propertyType, setPropertyType } = useOnboardingStore();

  return (
    <View className="flex-row flex-wrap gap-3">
      {propertyTypes.map(({ type, label, icon }) => (
        <Pressable
          key={type}
          onPress={() => setPropertyType(type)}
          className={`w-[30%] aspect-square items-center justify-center rounded-lg border-2 ${
            propertyType === type
              ? 'border-primary-600 bg-primary-50'
              : 'border-neutral-200 bg-white'
          }`}
        >
          <View className="mb-2">{icon}</View>
          <Text
            className={`text-sm font-body-medium ${
              propertyType === type ? 'text-primary-600' : 'text-neutral-700'
            }`}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function IntentScreen() {
  const router = useRouter();
  const { propertyType, transactionType, setCurrentStep } = useOnboardingStore();

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);

  useEffect(() => {
    setCurrentStep(1);
    titleOpacity.value = withTiming(1, { duration: 500 });
    titleY.value = withTiming(0, { duration: 500 });
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const canContinue = propertyType !== null && transactionType !== null;

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
        <Animated.View style={titleStyle}>
          <Text className="text-3xl font-heading-extrabold text-neutral-900 mb-2">
            What are you{'\n'}looking for?
          </Text>
          <Text className="text-base font-body text-neutral-500 mb-8">
            Select property type and transaction
          </Text>
        </Animated.View>

        <Text className="text-sm font-heading-semibold text-neutral-700 mb-3 uppercase tracking-wider">
          Transaction Type
        </Text>
        <BuyRentToggle />

        <Text className="text-sm font-heading-semibold text-neutral-700 mb-3 mt-8 uppercase tracking-wider">
          Property Type
        </Text>
        <IntentGrid />
      </ScrollView>

      <View className="px-6 pb-10">
        <Button
          title="Continue"
          onPress={() => router.push('/(onboarding)/location-budget')}
          disabled={!canContinue}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}
