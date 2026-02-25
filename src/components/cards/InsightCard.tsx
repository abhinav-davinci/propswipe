import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { TrendingUp, ShieldCheck, AlertTriangle, Lightbulb, BookOpen, ArrowRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import type { Insight } from '../../types/insight';

const iconMap: Record<string, React.ReactNode> = {
  'trending-up': <TrendingUp size={20} color={colors.primary[600]} />,
  'shield-check': <ShieldCheck size={20} color={colors.primary[600]} />,
  'alert-triangle': <AlertTriangle size={20} color={colors.warning} />,
  'percent': <Lightbulb size={20} color={colors.accent[500]} />,
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  tip: { bg: 'bg-accent-50', text: 'text-accent-700' },
  trend: { bg: 'bg-primary-50', text: 'text-primary-700' },
  alert: { bg: 'bg-red-50', text: 'text-red-700' },
  guide: { bg: 'bg-blue-50', text: 'text-blue-700' },
};

interface InsightCardProps {
  insight: Insight;
  onPress?: () => void;
}

export function InsightCard({ insight, onPress }: InsightCardProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 32;
  const catStyle = categoryColors[insight.category] ?? categoryColors.tip;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-lg p-4 shadow-sm border border-neutral-100"
      style={{ width: cardWidth }}
    >
      <View className="flex-row items-start gap-3">
        <View className="w-10 h-10 rounded-md bg-primary-50 items-center justify-center">
          {iconMap[insight.icon] ?? <BookOpen size={20} color={colors.primary[600]} />}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <View className={`px-2 py-0.5 rounded-sm ${catStyle.bg}`}>
              <Text className={`text-xs font-body-medium ${catStyle.text} uppercase`}>
                {insight.category}
              </Text>
            </View>
            <Text className="text-xs font-body text-neutral-400">
              {insight.readTimeMinutes} min read
            </Text>
          </View>
          <Text className="text-base font-heading-semibold text-neutral-900 mb-1" numberOfLines={2}>
            {insight.title}
          </Text>
          <Text className="text-sm font-body text-neutral-500" numberOfLines={2}>
            {insight.summary}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center justify-end mt-3">
        <Text className="text-sm font-heading-semibold text-primary-600 mr-1">Read more</Text>
        <ArrowRight size={14} color={colors.primary[600]} />
      </View>
    </Pressable>
  );
}
