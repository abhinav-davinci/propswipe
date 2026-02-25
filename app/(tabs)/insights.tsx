import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  TrendingUp, TrendingDown, BarChart3, Newspaper, Lightbulb,
  MapPin, ChevronRight, Filter,
} from 'lucide-react-native';
import { SafeScreen } from '../../src/components/layout/SafeScreen';
import { Chip } from '../../src/components/ui/Chip';
import { useInsightStore } from '../../src/stores/insightStore';
import { mockInsights, mockNews, mockMarketPulse, mockNeighbourhoodChapters } from '../../src/mocks/insights';
import { colors } from '../../src/theme/colors';
import type { MarketPulse } from '../../src/types/insight';

function MarketTicker({ data }: { data: MarketPulse[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
      <View className="flex-row gap-3 px-4">
        {data.map((item) => {
          const isUp = item.priceChange > 0;
          return (
            <View key={item.id} className="bg-white rounded-lg p-3 border border-neutral-100 w-36">
              <Text className="text-sm font-heading-semibold text-neutral-900 mb-1">{item.area}</Text>
              <Text className="text-base font-heading text-neutral-900">
                ₹{item.avgPrice.toLocaleString('en-IN')}
              </Text>
              <Text className="text-xs font-body text-neutral-500">/sq.ft</Text>
              <View className="flex-row items-center mt-1">
                {isUp ? <TrendingUp size={12} color={colors.success} /> : <TrendingDown size={12} color={colors.error} />}
                <Text className={`text-xs font-heading-semibold ml-1 ${isUp ? 'text-success' : 'text-error'}`}>
                  {isUp ? '+' : ''}{item.priceChange}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

type InsightFilter = 'all' | 'tip' | 'trend' | 'alert' | 'guide';

export default function InsightsScreen() {
  const router = useRouter();
  const { setInsights, setNews, setMarketPulse, setNeighbourhoodChapters } = useInsightStore();
  const [filter, setFilter] = useState<InsightFilter>('all');

  useEffect(() => {
    setInsights(mockInsights);
    setNews(mockNews);
    setMarketPulse(mockMarketPulse);
    setNeighbourhoodChapters(mockNeighbourhoodChapters);
  }, []);

  const filteredInsights = filter === 'all'
    ? mockInsights
    : mockInsights.filter((i) => i.category === filter);

  const categoryColors: Record<string, string> = {
    tip: 'text-accent-700',
    trend: 'text-primary-700',
    alert: 'text-red-700',
    guide: 'text-blue-700',
  };

  return (
    <SafeScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        {/* Header */}
        <View className="px-4 py-3">
          <Text className="text-2xl font-heading-extrabold text-neutral-900">Insights</Text>
          <Text className="text-sm font-body text-neutral-500">Pune market intelligence</Text>
        </View>

        {/* Market Pulse Section */}
        <View className="mb-4">
          <View className="flex-row items-center px-4 mb-3">
            <BarChart3 size={18} color={colors.primary[600]} />
            <Text className="text-base font-heading-semibold text-neutral-900 ml-2">Market Pulse</Text>
            <Text className="text-xs font-body text-neutral-400 ml-auto">Feb 2026</Text>
          </View>
          <MarketTicker data={mockMarketPulse} />
        </View>

        {/* Neighbourhood Guides */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <View className="flex-row items-center">
              <MapPin size={18} color={colors.primary[600]} />
              <Text className="text-base font-heading-semibold text-neutral-900 ml-2">Area Guides</Text>
            </View>
            <Pressable className="flex-row items-center">
              <Text className="text-sm font-heading-semibold text-primary-600">See All</Text>
              <ChevronRight size={16} color={colors.primary[600]} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3 px-4">
              {mockNeighbourhoodChapters.map((chapter) => (
                <Pressable
                  key={chapter.id}
                  onPress={() => router.push(`/neighbourhood/${chapter.slug}`)}
                  className="w-56 rounded-lg overflow-hidden border border-neutral-100"
                >
                  <Image source={{ uri: chapter.heroImage }} style={{ width: 224, height: 120 }} contentFit="cover" />
                  <View className="p-3 bg-white">
                    <Text className="text-base font-heading-semibold text-neutral-900">{chapter.name}</Text>
                    <Text className="text-xs font-body text-neutral-500">{chapter.tagline}</Text>
                    <View className="flex-row items-center mt-1.5">
                      <Text className="text-sm font-heading text-primary-600">₹{chapter.avgPrice.toLocaleString('en-IN')}/sqft</Text>
                      <Text className="text-xs font-heading-semibold text-success ml-2">+{chapter.priceChange}%</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Insights Section */}
        <View className="px-4">
          <View className="flex-row items-center mb-3">
            <Lightbulb size={18} color={colors.accent[500]} />
            <Text className="text-base font-heading-semibold text-neutral-900 ml-2">Insights & Tips</Text>
          </View>

          {/* Filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            <View className="flex-row gap-2">
              {(['all', 'tip', 'trend', 'alert', 'guide'] as InsightFilter[]).map((f) => (
                <Chip key={f} label={f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} selected={filter === f} onPress={() => setFilter(f)} size="sm" />
              ))}
            </View>
          </ScrollView>

          {/* Insight cards */}
          {filteredInsights.map((insight) => (
            <Pressable key={insight.id} className="bg-white rounded-lg p-4 mb-3 border border-neutral-100">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className={`text-xs font-body-medium uppercase ${categoryColors[insight.category] ?? 'text-neutral-600'}`}>
                  {insight.category}
                </Text>
                <Text className="text-xs font-body text-neutral-400">{insight.readTimeMinutes} min</Text>
              </View>
              <Text className="text-base font-heading-semibold text-neutral-900 mb-1">{insight.title}</Text>
              <Text className="text-sm font-body text-neutral-500" numberOfLines={2}>{insight.summary}</Text>
            </Pressable>
          ))}
        </View>

        {/* News Section */}
        <View className="px-4 mt-4 mb-4">
          <View className="flex-row items-center mb-3">
            <Newspaper size={18} color={colors.info} />
            <Text className="text-base font-heading-semibold text-neutral-900 ml-2">Latest News</Text>
          </View>
          {mockNews.map((news) => (
            <Pressable
              key={news.id}
              onPress={() => router.push(`/news/${news.id}`)}
              className="bg-white rounded-lg overflow-hidden mb-3 border border-neutral-100"
            >
              <View className="flex-row">
                <Image source={{ uri: news.imageUrl }} style={{ width: 100, height: 100 }} contentFit="cover" />
                <View className="flex-1 p-3">
                  <Text className="text-xs font-body-medium text-primary-600 uppercase mb-0.5">{news.category}</Text>
                  <Text className="text-sm font-heading-semibold text-neutral-900" numberOfLines={2}>{news.title}</Text>
                  <Text className="text-xs font-body text-neutral-400 mt-1">{news.source}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View className="h-4" />
      </ScrollView>
    </SafeScreen>
  );
}
