import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useScreenLayout } from '../../hooks/useScreenLayout';
import type { NewsItem } from '../../types/insight';

const categoryLabels: Record<string, string> = {
  market: 'MARKET',
  policy: 'POLICY',
  infrastructure: 'INFRA',
  general: 'NEWS',
};

const categoryColors: Record<string, string> = {
  market: '#147A78',
  policy: '#7C3AED',
  infrastructure: '#E8960F',
  general: '#647575',
};

interface NewsShortCardProps {
  news: NewsItem;
}

export function NewsShortCard({ news }: NewsShortCardProps) {
  const { cardWidth, cardImageHeight, isSmallDevice } = useScreenLayout();
  const catColor = categoryColors[news.category] ?? colors.neutral[500];

  const formattedDate = new Date(news.publishedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View
      className="bg-white rounded-lg overflow-hidden shadow-md"
      style={{ width: cardWidth }}
    >
      {/* Hero image */}
      <View style={{ height: cardImageHeight, position: 'relative' }}>
        <Image
          source={{ uri: news.imageUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' }}
        />

        {/* Category + Source badge */}
        <View className="absolute top-3 left-3 flex-row items-center gap-2">
          <View
            className="px-2.5 py-1 rounded-md"
            style={{ backgroundColor: catColor }}
          >
            <Text className="text-xs font-heading-semibold text-white">
              {categoryLabels[news.category] ?? 'NEWS'}
            </Text>
          </View>
        </View>

        {/* News icon */}
        <View className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 items-center justify-center">
          <Newspaper size={16} color="white" />
        </View>

        {/* Headline on image */}
        <View className="absolute bottom-3 left-4 right-4">
          <Text className="text-xs font-body text-white/70 mb-1">
            {news.source}
          </Text>
          <Text
            className={`${isSmallDevice ? 'text-lg' : 'text-xl'} font-heading-extrabold text-white leading-tight`}
            numberOfLines={2}
          >
            {news.title}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className={`${isSmallDevice ? 'p-3' : 'p-4'}`}>
        {/* Body text */}
        <Text
          className="text-sm font-body text-neutral-700 leading-relaxed mb-3"
          numberOfLines={isSmallDevice ? 4 : 5}
        >
          {news.body}
        </Text>

        {/* Footer: date + read more */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Calendar size={13} color={colors.neutral[400]} />
            <Text className="text-xs font-body text-neutral-400 ml-1">
              {formattedDate}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-sm font-heading-semibold text-primary-600 mr-1">
              Read Full
            </Text>
            <ArrowRight size={14} color={colors.primary[600]} />
          </View>
        </View>
      </View>
    </View>
  );
}
