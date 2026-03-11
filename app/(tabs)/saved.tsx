import React, { useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable, useWindowDimensions, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MapPin, Bed, Maximize2, Trash2, GitCompareArrows, Star } from 'lucide-react-native';
import { SafeScreen } from '../../src/components/layout/SafeScreen';
import { MatchScoreBadge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { usePropertyStore } from '../../src/stores/propertyStore';
import { formatCurrency } from '../../src/utils/formatCurrency';
import { colors } from '../../src/theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../src/theme/typography';
import type { Property } from '../../src/types/property';

// ─── Super Liked Badge (subtle frosted star) ─────────────────
function SuperLikedBadge() {
  return (
    <View style={badgeStyles.container}>
      <Star size={12} color={colors.accent[500]} fill={colors.accent[500]} />
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
});

// ─── Property List Item (memoized) ───────────────────────────
const PropertyListItem = React.memo(function PropertyListItem({ property, isSuperLiked, onPress, onRemove, onCompare }: {
  property: Property;
  isSuperLiked: boolean;
  onPress: () => void;
  onRemove: () => void;
  onCompare: () => void;
}) {
  const { width } = useWindowDimensions();
  const imageSize = Math.min(Math.round(width * 0.28), 120);

  return (
    <Pressable onPress={onPress} style={listStyles.card}>
      <View style={listStyles.row}>
        <View>
          <Image
            source={{ uri: property.images[0] }}
            style={{ width: imageSize, height: imageSize + 10, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}
            contentFit="cover"
          />
          {isSuperLiked && <SuperLikedBadge />}
        </View>
        <View style={listStyles.content}>
          <View>
            <View style={listStyles.titleRow}>
              <Text style={listStyles.title} numberOfLines={1}>
                {property.title}
              </Text>
              <MatchScoreBadge score={property.matchScore} size="sm" />
            </View>
            <View style={listStyles.locationRow}>
              <MapPin size={12} color={colors.neutral[500]} />
              <Text style={listStyles.location}>{property.location.area}</Text>
            </View>
            <Text style={listStyles.price}>
              {property.transactionType === 'rent'
                ? `₹${(property.price / 1000).toFixed(0)}K/mo`
                : formatCurrency(property.price)}
            </Text>
          </View>
          <View style={listStyles.bottomRow}>
            <View style={listStyles.specs}>
              <View style={listStyles.specItem}>
                <Bed size={12} color={colors.neutral[500]} />
                <Text style={listStyles.specText}>{property.specs.bedrooms}BHK</Text>
              </View>
              <View style={listStyles.specItem}>
                <Maximize2 size={12} color={colors.neutral[500]} />
                <Text style={listStyles.specText}>{property.specs.carpetArea}sqft</Text>
              </View>
            </View>
            <View style={listStyles.actions}>
              <Pressable onPress={onCompare} hitSlop={6} style={listStyles.actionBtn}>
                <GitCompareArrows size={16} color={colors.primary[600]} />
              </Pressable>
              <Pressable onPress={onRemove} hitSlop={6} style={listStyles.actionBtn}>
                <Trash2 size={16} color={colors.error} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const listStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  row: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[900],
    flex: 1,
    marginRight: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    color: colors.neutral[500],
    marginLeft: 4,
  },
  price: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    color: colors.primary[600],
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  specs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specText: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    color: colors.neutral[500],
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
});

// ─── Main Screen ─────────────────────────────────────────────
export default function SavedScreen() {
  const router = useRouter();
  const { savedProperties, superLiked, unsaveProperty, addToCompare, compareList } = usePropertyStore();

  // Merge: super liked on top, then regular saved (no duplicates)
  const superLikedIds = useMemo(() => new Set(superLiked.map((p) => p.id)), [superLiked]);

  const sortedProperties = useMemo(() => {
    const superLikedItems = savedProperties.filter((p) => superLikedIds.has(p.id));
    const regularItems = savedProperties.filter((p) => !superLikedIds.has(p.id));
    return [...superLikedItems, ...regularItems];
  }, [savedProperties, superLikedIds]);

  const renderProperty = useCallback(({ item }: { item: Property }) => (
    <PropertyListItem
      property={item}
      isSuperLiked={superLikedIds.has(item.id)}
      onPress={() => router.push(`/property/${item.id}`)}
      onRemove={() => unsaveProperty(item.id)}
      onCompare={() => addToCompare(item)}
    />
  ), [superLikedIds, router, unsaveProperty, addToCompare]);

  const keyExtractor = useCallback((item: Property) => item.id, []);

  const emptyList = useMemo(() => (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>💚</Text>
      <Text style={{ fontFamily: fontFamilies.heading, fontSize: fontSizes.lg, color: colors.neutral[900], marginBottom: 8 }}>
        No saved properties yet
      </Text>
      <Text style={{ fontFamily: fontFamilies.body, fontSize: fontSizes.sm, color: colors.neutral[500], textAlign: 'center', paddingHorizontal: 32 }}>
        Swipe right on properties you like to save them here
      </Text>
    </View>
  ), []);

  return (
    <SafeScreen>
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={{ fontFamily: fontFamilies.headingExtrabold, fontSize: fontSizes['2xl'], lineHeight: lineHeights['2xl'], color: colors.neutral[900] }}>
          Saved
        </Text>
        {savedProperties.length > 0 && (
          <Text style={{ fontFamily: fontFamilies.body, fontSize: fontSizes.sm, color: colors.neutral[500], marginTop: 2 }}>
            {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'}
          </Text>
        )}
      </View>

      {/* Compare bar */}
      {compareList.length > 0 && (
        <View style={screenStyles.compareBar}>
          <Text style={screenStyles.compareText}>
            {compareList.length}/3 selected for comparison
          </Text>
          <Button
            title="Compare"
            onPress={() => router.push('/property/compare')}
            size="sm"
            variant="primary"
          />
        </View>
      )}

      <FlatList
        data={sortedProperties}
        renderItem={renderProperty}
        keyExtractor={keyExtractor}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        ListEmptyComponent={emptyList}
      />
    </SafeScreen>
  );
}

const screenStyles = StyleSheet.create({
  compareBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compareText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    color: colors.primary[700],
  },
});
