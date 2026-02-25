import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, ArrowRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useScreenLayout } from '../../hooks/useScreenLayout';
import type { NeighbourhoodChapter } from '../../types/insight';

interface NeighbourhoodChapterCardProps {
  chapter: NeighbourhoodChapter;
  onPress?: () => void;
}

export function NeighbourhoodChapterCard({ chapter, onPress }: NeighbourhoodChapterCardProps) {
  const { cardWidth, neighbourhoodHeroHeight } = useScreenLayout();

  return (
    <Pressable
      onPress={onPress}
      className="rounded-lg overflow-hidden shadow-sm"
      style={{ width: cardWidth }}
    >
      <View style={{ height: neighbourhoodHeroHeight, position: 'relative' }}>
        <Image
          source={{ uri: chapter.heroImage }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' }}
        />
        <View className="absolute bottom-3 left-4 right-4">
          <View className="flex-row items-center mb-1">
            <MapPin size={14} color="white" />
            <Text className="text-xs font-body text-white/70 ml-1">Neighbourhood Guide</Text>
          </View>
          <Text className="text-xl font-heading-extrabold text-white">{chapter.name}</Text>
          <Text className="text-sm font-body text-white/80">{chapter.tagline}</Text>
        </View>
      </View>

      <View className="bg-white p-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xs font-body text-neutral-500">Avg. Price</Text>
            <Text className="text-base font-heading-semibold text-neutral-900">
              ₹{chapter.avgPrice.toLocaleString('en-IN')}/sqft
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs font-body text-neutral-500">Growth</Text>
            <Text className="text-base font-heading-semibold text-success">
              +{chapter.priceChange}%
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-1.5">
          {chapter.highlights.slice(0, 4).map((h) => (
            <View key={h} className="bg-primary-50 rounded-sm px-2 py-0.5">
              <Text className="text-xs font-body text-primary-700">{h}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row items-center justify-end mt-3">
          <Text className="text-sm font-heading-semibold text-primary-600 mr-1">Explore</Text>
          <ArrowRight size={14} color={colors.primary[600]} />
        </View>
      </View>
    </Pressable>
  );
}
