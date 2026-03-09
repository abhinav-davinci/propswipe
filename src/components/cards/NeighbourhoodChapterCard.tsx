import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, ArrowRight, TrendingUp } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useScreenLayout } from '../../hooks/useScreenLayout';
import type { NeighbourhoodChapter } from '../../types/insight';

interface NeighbourhoodChapterCardProps {
  chapter: NeighbourhoodChapter;
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <View className="flex-row items-center mb-1.5">
      <Text className="text-xs font-body text-neutral-600 w-24" numberOfLines={1}>
        {label}
      </Text>
      <View className="flex-1 h-2 bg-neutral-100 rounded-full mx-2 overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            width: `${score * 10}%`,
            backgroundColor: score >= 8 ? colors.primary[600] : score >= 6 ? colors.accent[500] : colors.neutral[400],
          }}
        />
      </View>
      <Text className="text-xs font-heading-semibold text-neutral-700 w-6 text-right">
        {score}
      </Text>
    </View>
  );
}

export function NeighbourhoodChapterCard({ chapter }: NeighbourhoodChapterCardProps) {
  const { cardWidth, cardImageHeight, isSmallDevice } = useScreenLayout();

  return (
    <View
      className="bg-white rounded-lg overflow-hidden shadow-md"
      style={{ width: cardWidth }}
    >
      {/* Hero image */}
      <View style={{ height: cardImageHeight, position: 'relative' }}>
        <Image
          source={{ uri: chapter.heroImage }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' }}
        />

        {/* Badge */}
        <View className="absolute top-3 left-3">
          <View className="bg-primary-600 px-2.5 py-1 rounded-md flex-row items-center gap-1.5">
            <MapPin size={12} color="white" />
            <Text className="text-xs font-heading-semibold text-white">NEIGHBOURHOOD</Text>
          </View>
        </View>

        {/* Title overlay */}
        <View className="absolute bottom-3 left-4 right-4">
          <Text
            className={`${isSmallDevice ? 'text-2xl' : 'text-3xl'} font-heading-extrabold text-white`}
          >
            {chapter.name}
          </Text>
          <Text className="text-sm font-body text-white/80">{chapter.tagline}</Text>
        </View>
      </View>

      {/* Content */}
      <View className={`${isSmallDevice ? 'p-3' : 'p-4'}`}>
        {/* Price + Growth row */}
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xs font-body text-neutral-500">Avg. Price</Text>
            <Text className="text-lg font-heading-semibold text-neutral-900">
              ₹{chapter.avgPrice.toLocaleString('en-IN')}/sqft
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs font-body text-neutral-500">Growth</Text>
            <View className="flex-row items-center gap-1">
              <TrendingUp size={14} color={colors.success} />
              <Text className="text-lg font-heading-semibold text-success">
                +{chapter.priceChange}%
              </Text>
            </View>
          </View>
        </View>

        {/* Score bars */}
        <View className="mb-3">
          {chapter.scores.slice(0, isSmallDevice ? 4 : 6).map((s) => (
            <ScoreBar key={s.category} label={s.category} score={s.score} />
          ))}
        </View>

        {/* Highlights */}
        <View className="flex-row flex-wrap gap-1.5 mb-3">
          {chapter.highlights.slice(0, 4).map((h) => (
            <View key={h} className="bg-primary-50 rounded-sm px-2 py-0.5">
              <Text className="text-xs font-body text-primary-700">{h}</Text>
            </View>
          ))}
        </View>

        {/* Explore link */}
        <View className="flex-row items-center justify-end">
          <Text className="text-sm font-heading-semibold text-primary-600 mr-1">Explore</Text>
          <ArrowRight size={14} color={colors.primary[600]} />
        </View>
      </View>
    </View>
  );
}
