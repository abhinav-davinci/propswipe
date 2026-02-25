import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, Building2, Home, MapPin, Crown, Minimize2, Grid3X3, Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { useFeedStore } from '../../src/stores/feedStore';
import { Chip } from '../../src/components/ui/Chip';
import { Button } from '../../src/components/ui/Button';
import { areasByZone, zoneLabels } from '../../src/utils/puneAreas';
import { colors } from '../../src/theme/colors';
import type { PropertyType, TransactionType } from '../../src/types/property';

const propertyTypes: { type: PropertyType; label: string; icon: React.ReactNode }[] = [
  { type: 'apartment', label: 'Apartment', icon: <Building2 size={24} color={colors.primary[600]} /> },
  { type: 'villa', label: 'Villa', icon: <Home size={24} color={colors.primary[600]} /> },
  { type: 'plot', label: 'Plot', icon: <MapPin size={24} color={colors.primary[600]} /> },
  { type: 'penthouse', label: 'Penthouse', icon: <Crown size={24} color={colors.primary[600]} /> },
  { type: 'studio', label: 'Studio', icon: <Minimize2 size={24} color={colors.primary[600]} /> },
  { type: 'rowhouse', label: 'Row House', icon: <Grid3X3 size={24} color={colors.primary[600]} /> },
];

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

export default function EditPreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    propertyType: savedPropertyType,
    transactionType: savedTransactionType,
    selectedAreas: savedAreas,
    budgetMin: savedBudgetMin,
    budgetMax: savedBudgetMax,
    setPropertyType,
    setTransactionType,
    setSelectedAreas,
    setBudget,
    toggleArea,
  } = useOnboardingStore();
  const resetFeed = useFeedStore((s) => s.reset);

  // Local state mirrors store values so changes are immediate
  const [localPropertyType, setLocalPropertyType] = useState<PropertyType | null>(savedPropertyType);
  const [localTransactionType, setLocalTransactionType] = useState<TransactionType | null>(savedTransactionType);
  const [localAreas, setLocalAreas] = useState<string[]>(savedAreas);
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState(-1);

  const budgetPresets = localTransactionType === 'rent' ? BUDGET_PRESETS_RENT : BUDGET_PRESETS_BUY;

  // Match saved budget to a preset index on mount
  useEffect(() => {
    const presets = savedTransactionType === 'rent' ? BUDGET_PRESETS_RENT : BUDGET_PRESETS_BUY;
    const idx = presets.findIndex((p) => p.min === savedBudgetMin && p.max === savedBudgetMax);
    setSelectedBudgetIndex(idx);
  }, []);

  // Reset budget index when transaction type changes
  useEffect(() => {
    const presets = localTransactionType === 'rent' ? BUDGET_PRESETS_RENT : BUDGET_PRESETS_BUY;
    const idx = presets.findIndex((p) => p.min === savedBudgetMin && p.max === savedBudgetMax);
    setSelectedBudgetIndex(idx);
  }, [localTransactionType]);

  const handleToggleArea = (areaName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalAreas((prev) =>
      prev.includes(areaName) ? prev.filter((a) => a !== areaName) : [...prev, areaName]
    );
  };

  const handleBudgetSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBudgetIndex(index);
  };

  const canSave = localPropertyType !== null && localTransactionType !== null && localAreas.length > 0 && selectedBudgetIndex >= 0;

  const handleSave = () => {
    if (!canSave) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Persist changes to the onboarding store
    setPropertyType(localPropertyType!);
    setTransactionType(localTransactionType!);
    setSelectedAreas(localAreas);
    const preset = budgetPresets[selectedBudgetIndex];
    setBudget(preset.min, preset.max);

    // Reset the feed so discover regenerates based on new preferences
    resetFeed();

    // Navigate to match animation → then to discover
    router.replace('/(onboarding)/match-animation');
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-white border-b border-neutral-100"
        style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}>
        <View className="flex-row items-center px-4">
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-neutral-100 items-center justify-center mr-3"
          >
            <ArrowLeft size={20} color={colors.neutral[700]} />
          </Pressable>
          <Text className="text-lg font-heading-extrabold text-neutral-900">Edit Preferences</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ─── Transaction Type ─── */}
        <View className="px-5 pt-6 pb-2">
          <Text className="text-xs font-heading-semibold text-neutral-500 mb-3 uppercase tracking-wider">
            Transaction Type
          </Text>
          <View className="flex-row bg-neutral-100 rounded-xl p-1">
            {(['buy', 'rent'] as TransactionType[]).map((type) => (
              <Pressable
                key={type}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLocalTransactionType(type);
                }}
                className={`flex-1 py-3 rounded-lg items-center ${
                  localTransactionType === type ? 'bg-primary-600' : ''
                }`}
                style={{ shadowColor: localTransactionType === type ? '#094E4C' : 'transparent',
                  shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: localTransactionType === type ? 3 : 0 }}
              >
                <Text className={`text-base font-heading-semibold ${
                  localTransactionType === type ? 'text-white' : 'text-neutral-500'
                }`}>
                  {type === 'buy' ? 'Buy' : 'Rent'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ─── Property Type ─── */}
        <View className="px-5 pt-5 pb-2">
          <Text className="text-xs font-heading-semibold text-neutral-500 mb-3 uppercase tracking-wider">
            Property Type
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {propertyTypes.map(({ type, label, icon }) => (
              <Pressable
                key={type}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLocalPropertyType(type);
                }}
                className={`w-[30%] aspect-square items-center justify-center rounded-xl border-2 ${
                  localPropertyType === type
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                {localPropertyType === type && (
                  <View className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-600 items-center justify-center">
                    <Check size={12} color="white" strokeWidth={3} />
                  </View>
                )}
                <View className="mb-1.5">{icon}</View>
                <Text className={`text-xs font-body-medium ${
                  localPropertyType === type ? 'text-primary-600' : 'text-neutral-700'
                }`}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ─── Preferred Areas ─── */}
        <View className="px-5 pt-6 pb-2">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs font-heading-semibold text-neutral-500 uppercase tracking-wider">
              Preferred Areas
            </Text>
            <Text className="text-xs font-body text-neutral-400">
              {localAreas.length} selected
            </Text>
          </View>
          <Text className="text-[11px] font-body text-neutral-400 mb-3">
            Select at least 1 area
          </Text>

          {Object.entries(areasByZone).map(([zone, areas]) => (
            <View key={zone} className="mb-4">
              <Text className="text-[11px] font-heading-semibold text-neutral-400 mb-2 uppercase">
                {zoneLabels[zone]}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {areas.map((area) => (
                  <Chip
                    key={area.slug}
                    label={area.name}
                    selected={localAreas.includes(area.name)}
                    onPress={() => handleToggleArea(area.name)}
                    size="sm"
                  />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* ─── Budget Range ─── */}
        <View className="px-5 pt-2 pb-4">
          <Text className="text-xs font-heading-semibold text-neutral-500 mb-3 uppercase tracking-wider">
            Budget Range
          </Text>
          <View className="gap-2">
            {budgetPresets.map((preset, index) => (
              <Pressable
                key={index}
                onPress={() => handleBudgetSelect(index)}
                className={`py-3.5 px-4 rounded-xl border-2 flex-row items-center justify-between ${
                  selectedBudgetIndex === index
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <Text className={`text-base font-body-medium ${
                  selectedBudgetIndex === index ? 'text-primary-700' : 'text-neutral-700'
                }`}>
                  {preset.label}
                </Text>
                {selectedBudgetIndex === index && (
                  <View className="w-5 h-5 rounded-full bg-primary-600 items-center justify-center">
                    <Check size={12} color="white" strokeWidth={3} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ─── Bottom CTA ─── */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-5"
        style={{ paddingBottom: insets.bottom + 8, paddingTop: 12 }}>
        <Button
          title="Find New Matches"
          onPress={handleSave}
          disabled={!canSave}
          fullWidth
          size="lg"
          variant="accent"
        />
      </View>
    </View>
  );
}
