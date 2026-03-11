import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatCurrency';
import { MatchScoreBadge } from '../ui/Badge';
import type { Property } from '../../types/property';

interface PropertyContextCardProps {
  property: Property;
}

export function PropertyContextCard({ property }: PropertyContextCardProps) {
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/property/${property.id}`);
  };

  const priceDisplay =
    property.transactionType === 'rent'
      ? `₹${(property.price / 1000).toFixed(0)}K/mo`
      : formatCurrency(property.price);

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Image
        source={{ uri: property.images[0] }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>
        <Text style={styles.price}>{priceDisplay}</Text>
      </View>
      <MatchScoreBadge score={property.matchScore} size="sm" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.neutral[200],
  },
  info: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[900],
  },
  price: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.sm,
    color: colors.primary[600],
    marginTop: 2,
  },
});
