import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, BarChart3, ArrowRight, Home, Activity } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useScreenLayout } from '../../hooks/useScreenLayout';
import type { MarketPulse } from '../../types/insight';

const demandConfig: Record<string, { label: string; color: string; pct: number }> = {
  low: { label: 'Low', color: '#9AACAC', pct: 25 },
  medium: { label: 'Medium', color: '#E8960F', pct: 50 },
  high: { label: 'High', color: '#147A78', pct: 75 },
  very_high: { label: 'Very High', color: '#15803D', pct: 95 },
};

interface MarketPulseCardProps {
  data: MarketPulse;
}

export function MarketPulseCard({ data }: MarketPulseCardProps) {
  const { cardWidth, isSmallDevice } = useScreenLayout();
  const isUp = data.priceChange > 0;
  const demand = demandConfig[data.demandLevel] ?? demandConfig.medium;

  return (
    <View
      className="bg-white rounded-lg overflow-hidden shadow-md"
      style={{ width: cardWidth }}
    >
      {/* Gradient header */}
      <LinearGradient
        colors={['#094E4C', '#147A78']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-4 pb-5"
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <BarChart3 size={18} color="white" />
            <Text className="text-xs font-heading-semibold text-white/80 uppercase tracking-wider">
              Market Pulse
            </Text>
          </View>
          <Text className="text-xs font-body text-white/60">{data.period}</Text>
        </View>

        <Text className={`${isSmallDevice ? 'text-2xl' : 'text-3xl'} font-heading-extrabold text-white mb-1`}>
          {data.area}
        </Text>

        {/* Price + change */}
        <View className="flex-row items-end gap-3">
          <Text className="text-lg font-heading-semibold text-white">
            ₹{data.avgPrice.toLocaleString('en-IN')}/sqft
          </Text>
          <View className="flex-row items-center bg-white/15 rounded-md px-2 py-0.5">
            {isUp ? (
              <TrendingUp size={14} color="#86EFAC" />
            ) : (
              <TrendingDown size={14} color="#FCA5A5" />
            )}
            <Text
              className="text-sm font-heading-semibold ml-1"
              style={{ color: isUp ? '#86EFAC' : '#FCA5A5' }}
            >
              {isUp ? '+' : ''}{data.priceChange}%
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View className={`${isSmallDevice ? 'p-3' : 'p-4'}`}>
        {/* Demand bar */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center gap-1.5">
              <Activity size={14} color={colors.neutral[500]} />
              <Text className="text-xs font-body-medium text-neutral-500">Buyer Demand</Text>
            </View>
            <Text
              className="text-sm font-heading-semibold"
              style={{ color: demand.color }}
            >
              {demand.label}
            </Text>
          </View>
          <View className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{ width: `${demand.pct}%`, backgroundColor: demand.color }}
            />
          </View>
        </View>

        {/* Supply bar */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center gap-1.5">
              <Home size={14} color={colors.neutral[500]} />
              <Text className="text-xs font-body-medium text-neutral-500">New Listings</Text>
            </View>
            <Text className="text-sm font-heading-semibold text-neutral-700">
              {data.newListings} properties
            </Text>
          </View>
          <View className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min((data.newListings / 70) * 100, 100)}%`,
                backgroundColor: colors.primary[400],
              }}
            />
          </View>
        </View>

        {/* Stats grid */}
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1 bg-neutral-50 rounded-lg p-3 items-center">
            <Text className="text-xs font-body text-neutral-500 mb-0.5">Avg. Price</Text>
            <Text className="text-base font-heading-semibold text-neutral-900">
              ₹{(data.avgPrice / 1000).toFixed(1)}K
            </Text>
            <Text className="text-xs font-body text-neutral-400">per sqft</Text>
          </View>
          <View className="flex-1 bg-neutral-50 rounded-lg p-3 items-center">
            <Text className="text-xs font-body text-neutral-500 mb-0.5">YoY Change</Text>
            <Text
              className="text-base font-heading-semibold"
              style={{ color: isUp ? colors.success : colors.error }}
            >
              {isUp ? '+' : ''}{data.priceChange}%
            </Text>
            <Text className="text-xs font-body text-neutral-400">vs last year</Text>
          </View>
          <View className="flex-1 bg-neutral-50 rounded-lg p-3 items-center">
            <Text className="text-xs font-body text-neutral-500 mb-0.5">Supply</Text>
            <Text className="text-base font-heading-semibold text-neutral-900">
              {data.newListings}
            </Text>
            <Text className="text-xs font-body text-neutral-400">new units</Text>
          </View>
        </View>

        {/* Explore link */}
        <View className="flex-row items-center justify-end">
          <Text className="text-sm font-heading-semibold text-primary-600 mr-1">
            Explore {data.area}
          </Text>
          <ArrowRight size={14} color={colors.primary[600]} />
        </View>
      </View>
    </View>
  );
}
