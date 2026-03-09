import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useScreenLayout } from '../../hooks/useScreenLayout';
import type { Insight } from '../../types/insight';

const iconMap: Record<string, (color: string) => React.ReactNode> = {
  'trending-up': (c) => <TrendingUp size={22} color={c} />,
  'shield-check': (c) => <ShieldCheck size={22} color={c} />,
  'alert-triangle': (c) => <AlertTriangle size={22} color={c} />,
  'percent': (c) => <Lightbulb size={22} color={c} />,
};

const categoryTheme: Record<string, { gradient: [string, string]; badge: string; badgeText: string; accent: string }> = {
  tip: {
    gradient: ['#FEF7E8', '#FBE0A1'],
    badge: '#E8960F',
    badgeText: '#FFFFFF',
    accent: '#E8960F',
  },
  trend: {
    gradient: ['#E8F4F4', '#C3E4E3'],
    badge: '#147A78',
    badgeText: '#FFFFFF',
    accent: '#147A78',
  },
  alert: {
    gradient: ['#FEF2F2', '#FECACA'],
    badge: '#DC2626',
    badgeText: '#FFFFFF',
    accent: '#DC2626',
  },
  guide: {
    gradient: ['#EFF6FF', '#BFDBFE'],
    badge: '#0284C7',
    badgeText: '#FFFFFF',
    accent: '#0284C7',
  },
};

interface InsightCardProps {
  insight: Insight;
}

function SimpleBarChart({ items, unit, accent }: { items: { label: string; value: number; color?: string }[]; unit?: string; accent: string }) {
  const maxVal = Math.max(...items.map((i) => i.value));

  return (
    <View className="mt-1">
      {unit && (
        <Text className="text-xs font-body-medium text-neutral-500 mb-2">{unit}</Text>
      )}
      {items.map((item) => {
        const pct = Math.round((item.value / maxVal) * 100);
        const barColor = item.color ?? accent;
        return (
          <View key={item.label} className="flex-row items-center mb-2">
            <Text className="text-xs font-body text-neutral-600 w-20" numberOfLines={1}>
              {item.label}
            </Text>
            <View className="flex-1 h-5 bg-neutral-100 rounded-sm mx-2 overflow-hidden">
              <View
                className="h-full rounded-sm"
                style={{ width: `${pct}%`, backgroundColor: barColor, opacity: 0.85 }}
              />
            </View>
            <Text className="text-xs font-heading-semibold text-neutral-700 w-12 text-right">
              {item.value % 1 === 0 ? item.value : item.value.toFixed(2)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function InsightCard({ insight }: InsightCardProps) {
  const { cardWidth, isSmallDevice } = useScreenLayout();
  const theme = categoryTheme[insight.category] ?? categoryTheme.tip;
  const renderIcon = iconMap[insight.icon] ?? ((c: string) => <BookOpen size={22} color={c} />);

  return (
    <View
      className="bg-white rounded-lg overflow-hidden shadow-md"
      style={{ width: cardWidth }}
    >
      {/* Gradient header */}
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-4 pb-5"
      >
        <View className="flex-row items-center gap-2 mb-3">
          <View
            className="px-2.5 py-1 rounded-md"
            style={{ backgroundColor: theme.badge }}
          >
            <Text className="text-xs font-heading-semibold" style={{ color: theme.badgeText }}>
              {insight.category.toUpperCase()}
            </Text>
          </View>
          <Text className="text-xs font-body text-neutral-500">
            {insight.readTimeMinutes} min read
          </Text>
        </View>

        <View className="flex-row items-start gap-3">
          <View
            className="w-11 h-11 rounded-lg items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
          >
            {renderIcon(theme.accent)}
          </View>
          <Text
            className={`flex-1 ${isSmallDevice ? 'text-lg' : 'text-xl'} font-heading-extrabold text-neutral-900 leading-tight`}
            numberOfLines={3}
          >
            {insight.title}
          </Text>
        </View>
      </LinearGradient>

      {/* Chart infographic */}
      <View className={`${isSmallDevice ? 'px-3 pt-3' : 'px-4 pt-4'}`}>
        {insight.chartData && (
          <SimpleBarChart
            items={insight.chartData.items}
            unit={insight.chartData.unit}
            accent={theme.accent}
          />
        )}
      </View>

      {/* Key takeaway */}
      <View className={`${isSmallDevice ? 'px-3 pb-3 pt-2' : 'px-4 pb-4 pt-3'}`}>
        <View className="bg-primary-50 rounded-md p-3 flex-row">
          <Sparkles size={14} color={colors.primary[600]} style={{ marginTop: 2 }} />
          <Text className="text-xs font-body text-primary-800 ml-2 flex-1 leading-relaxed">
            {insight.keyTakeaway}
          </Text>
        </View>

        {/* Read more */}
        <View className="flex-row items-center justify-end mt-3">
          <Text className="text-sm font-heading-semibold text-primary-600 mr-1">Read more</Text>
          <ArrowRight size={14} color={colors.primary[600]} />
        </View>
      </View>
    </View>
  );
}
