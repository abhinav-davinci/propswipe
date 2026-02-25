import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { Chip } from '../../src/components/ui/Chip';
import { Button } from '../../src/components/ui/Button';
import { puneAreas, areasByZone, zoneLabels } from '../../src/utils/puneAreas';
import { formatCurrency } from '../../src/utils/formatCurrency';

const BUDGET_PRESETS_BUY = [
  { min: 2000000, max: 5000000, label: '₹20L - ₹50L' },
  { min: 5000000, max: 10000000, label: '₹50L - ₹1Cr' },
  { min: 10000000, max: 20000000, label: '₹1Cr - ₹2Cr' },
  { min: 20000000, max: 50000000, label: '₹2Cr - ₹5Cr' },
  { min: 50000000, max: 100000000, label: '₹5Cr+' },
];

const BUDGET_PRESETS_RENT = [
  { min: 8000, max: 15000, label: '₹8K - ₹15K' },
  { min: 15000, max: 25000, label: '₹15K - ₹25K' },
  { min: 25000, max: 40000, label: '₹25K - ₹40K' },
  { min: 40000, max: 75000, label: '₹40K - ₹75K' },
  { min: 75000, max: 200000, label: '₹75K+' },
];

export default function LocationBudgetScreen() {
  const router = useRouter();
  const {
    selectedAreas,
    toggleArea,
    budgetMin,
    budgetMax,
    setBudget,
    transactionType,
    setCurrentStep,
  } = useOnboardingStore();

  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState(-1);
  const budgetPresets = transactionType === 'rent' ? BUDGET_PRESETS_RENT : BUDGET_PRESETS_BUY;

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);

  useEffect(() => {
    setCurrentStep(2);
    titleOpacity.value = withTiming(1, { duration: 500 });
    titleY.value = withTiming(0, { duration: 500 });
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const canContinue = selectedAreas.length > 0 && selectedBudgetIndex >= 0;

  const handleBudgetSelect = (index: number) => {
    setSelectedBudgetIndex(index);
    const preset = budgetPresets[index];
    setBudget(preset.min, preset.max);
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
        <Animated.View style={titleStyle}>
          <Text className="text-3xl font-heading-extrabold text-neutral-900 mb-2">
            Where & how much?
          </Text>
          <Text className="text-base font-body text-neutral-500 mb-6">
            Pick your preferred areas and budget range
          </Text>
        </Animated.View>

        {/* Area Selection */}
        <Text className="text-sm font-heading-semibold text-neutral-700 mb-3 uppercase tracking-wider">
          Preferred Areas
        </Text>
        <Text className="text-xs font-body text-neutral-400 mb-3">
          Select at least 1 area ({selectedAreas.length} selected)
        </Text>

        {Object.entries(areasByZone).map(([zone, areas]) => (
          <View key={zone} className="mb-4">
            <Text className="text-xs font-heading-semibold text-neutral-500 mb-2">
              {zoneLabels[zone]}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {areas.map((area) => (
                <Chip
                  key={area.slug}
                  label={area.name}
                  selected={selectedAreas.includes(area.name)}
                  onPress={() => toggleArea(area.name)}
                  size="sm"
                />
              ))}
            </View>
          </View>
        ))}

        {/* Budget Selection */}
        <Text className="text-sm font-heading-semibold text-neutral-700 mb-3 mt-6 uppercase tracking-wider">
          Budget Range
        </Text>
        <View className="gap-2 mb-8">
          {budgetPresets.map((preset, index) => (
            <Pressable
              key={index}
              onPress={() => handleBudgetSelect(index)}
              className={`py-3 px-4 rounded-md border ${
                selectedBudgetIndex === index
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              <Text
                className={`text-base font-body-medium ${
                  selectedBudgetIndex === index ? 'text-primary-600' : 'text-neutral-700'
                }`}
              >
                {preset.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View className="px-6 pb-10">
        <Button
          title="Find My Matches"
          onPress={() => router.push('/(onboarding)/match-animation')}
          disabled={!canContinue}
          fullWidth
          size="lg"
          variant="accent"
        />
      </View>
    </View>
  );
}
