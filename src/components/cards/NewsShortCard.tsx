import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../theme/colors';
import type { NewsItem } from '../../types/insight';

interface NewsShortCardProps {
  news: NewsItem;
  onPress?: () => void;
}

export function NewsShortCard({ news, onPress }: NewsShortCardProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 32;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-neutral-100"
      style={{ width: cardWidth }}
    >
      <View className="flex-row">
        <Image
          source={{ uri: news.imageUrl }}
          style={{ width: 100, height: 100 }}
          contentFit="cover"
        />
        <View className="flex-1 p-3">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-xs font-body-medium text-primary-600 uppercase">
              {news.category}
            </Text>
            <Text className="text-xs font-body text-neutral-400">
              {news.source}
            </Text>
          </View>
          <Text className="text-sm font-heading-semibold text-neutral-900" numberOfLines={2}>
            {news.title}
          </Text>
          <Text className="text-xs font-body text-neutral-500 mt-1" numberOfLines={1}>
            {news.summary}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
