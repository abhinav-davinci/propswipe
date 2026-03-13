import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Bed, Bath, Maximize2, Sparkles, Film } from 'lucide-react-native';
import { MatchScoreBadge, Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { colors } from '../../theme/colors';
import { fontFamilies, fontSizes } from '../../theme/typography';
import { useScreenLayout } from '../../hooks/useScreenLayout';
import type { Property } from '../../types/property';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { cardWidth, cardImageHeight, isSmallDevice } = useScreenLayout();

  const hasVideo = !!property.videoTour;
  const totalMedia = property.images.length + (hasVideo ? 1 : 0);

  return (
    <View
      className="bg-white rounded-lg overflow-hidden shadow-md"
      style={{ width: cardWidth }}
    >
      {/* Image */}
      <View style={{ height: cardImageHeight, position: 'relative' }}>
        <Image
          source={{ uri: property.images[0] }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' }}
        />

        {/* Match Score */}
        <View className="absolute top-3 right-3">
          <MatchScoreBadge score={property.matchScore} size={isSmallDevice ? 'sm' : 'md'} />
        </View>

        {/* Tags + Video Tour badge */}
        <View className="absolute top-3 left-3 flex-row gap-1.5">
          {property.isNew && <Badge label="New" variant="success" />}
          {property.isPremium && <Badge label="Premium" variant="warning" />}
          {hasVideo && (
            <View style={cardStyles.videoChip}>
              <Film size={10} color={colors.white} />
              <Text style={cardStyles.videoChipText}>Video Tour</Text>
            </View>
          )}
        </View>

        {/* Price overlay */}
        <View className="absolute bottom-3 left-4 right-4">
          <Text className={`${isSmallDevice ? 'text-xl' : 'text-2xl'} font-heading-extrabold text-white`}>
            {property.transactionType === 'rent'
              ? `₹${(property.price / 1000).toFixed(0)}K/mo`
              : formatCurrency(property.price)}
          </Text>
          {property.pricePerSqft > 0 && (
            <Text className="text-xs font-body text-white/70">
              ₹{property.pricePerSqft.toLocaleString('en-IN')}/sq.ft
            </Text>
          )}
        </View>

        {/* Media count indicator */}
        <View className="absolute bottom-3 right-4 bg-black/40 rounded-sm px-2 py-0.5 flex-row items-center gap-1">
          {hasVideo && <Film size={10} color={colors.white} />}
          <Text className="text-xs font-body text-white">
            1/{totalMedia}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className={`${isSmallDevice ? 'p-3' : 'p-4'}`}>
        <Text className="text-lg font-heading text-neutral-900 mb-1" numberOfLines={1}>
          {property.title}
        </Text>

        <View className="flex-row items-center mb-2">
          <MapPin size={14} color={colors.neutral[500]} />
          <Text className="text-sm font-body text-neutral-500 ml-1" numberOfLines={1}>
            {property.location.area}, {property.location.subArea}
          </Text>
        </View>

        {/* Specs row */}
        <View className="flex-row items-center gap-4 mb-2">
          <View className="flex-row items-center">
            <Bed size={15} color={colors.neutral[600]} />
            <Text className="text-sm font-body-medium text-neutral-700 ml-1">
              {property.specs.bedrooms} BHK
            </Text>
          </View>
          <View className="flex-row items-center">
            <Bath size={15} color={colors.neutral[600]} />
            <Text className="text-sm font-body-medium text-neutral-700 ml-1">
              {property.specs.bathrooms} Bath
            </Text>
          </View>
          <View className="flex-row items-center">
            <Maximize2 size={15} color={colors.neutral[600]} />
            <Text className="text-sm font-body-medium text-neutral-700 ml-1">
              {property.specs.carpetArea} sqft
            </Text>
          </View>
        </View>

        {/* AI Summary */}
        <View className="bg-primary-50 rounded-md p-2.5 flex-row">
          <Sparkles size={14} color={colors.primary[600]} />
          <Text className="text-xs font-body text-primary-800 ml-2 flex-1" numberOfLines={2}>
            {property.aiSummary}
          </Text>
        </View>

        {/* Tags */}
        {!isSmallDevice && (
          <View className="flex-row flex-wrap gap-1.5 mt-2">
            {property.tags.slice(0, 3).map((tag) => (
              <View key={tag} className="bg-neutral-100 rounded-sm px-2 py-0.5">
                <Text className="text-xs font-body text-neutral-600">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  videoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  videoChipText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 10,
    color: colors.white,
  },
});
