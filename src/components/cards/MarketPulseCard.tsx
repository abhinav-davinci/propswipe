import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import type { MarketPulse } from '../../types/insight';

const demandColors: Record<string, string> = {
  low: 'text-neutral-500',
  medium: 'text-accent-500',
  high: 'text-primary-600',
  very_high: 'text-success',
};

interface MarketPulseCardProps {
  data: MarketPulse;
  onPress?: () => void;
}

export function MarketPulseCard({ data, onPress }: MarketPulseCardProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 32;
  const isUp = data.priceChange > 0;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-lg p-4 shadow-sm border border-neutral-100"
      style={{ width: cardWidth }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <BarChart3 size={18} color={colors.primary[600]} />
          <Text className="text-xs font-heading-semibold text-primary-600 uppercase">
            Market Pulse
          </Text>
        </View>
        <Text className="text-xs font-body text-neutral-400">{data.period}</Text>
      </View>

      <Text className="text-lg font-heading text-neutral-900 mb-2">{data.area}</Text>

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs font-body text-neutral-500 mb-0.5">Avg. Price/sqft</Text>
          <Text className="text-base font-heading-semibold text-neutral-900">
            ₹{data.avgPrice.toLocaleString('en-IN')}
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-xs font-body text-neutral-500 mb-0.5">Change</Text>
          <View className="flex-row items-center">
            {isUp ? (
              <TrendingUp size={14} color={colors.success} />
            ) : (
              <TrendingDown size={14} color={colors.error} />
            )}
            <Text className={`text-sm font-heading-semibold ml-1 ${isUp ? 'text-success' : 'text-error'}`}>
              {isUp ? '+' : ''}{data.priceChange}%
            </Text>
          </View>
        </View>

        <View>
          <Text className="text-xs font-body text-neutral-500 mb-0.5">Demand</Text>
          <Text className={`text-sm font-heading-semibold capitalize ${demandColors[data.demandLevel]}`}>
            {data.demandLevel.replace('_', ' ')}
          </Text>
        </View>

        <View>
          <Text className="text-xs font-body text-neutral-500 mb-0.5">New</Text>
          <Text className="text-sm font-heading-semibold text-neutral-700">{data.newListings}</Text>
        </View>
      </View>
    </Pressable>
  );
}
