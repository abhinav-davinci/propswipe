import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Upload,
  MapPin,
  Building,
  Maximize,
  Home,
  IndianRupee,
  CheckCircle2,
  Info,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../src/theme/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const BOTTOM_BAR_HEIGHT = 120;

// ─── Mock listing data (would come from store in production) ─

const MOCK_LISTING = {
  title: 'Spacious 3BHK Apartment',
  location: 'Koregaon Park, Pune',
  building: 'Sunshine Apartments',
  area: '1200 sq.ft',
  category: '3 BHK',
  price: '45L',
  amenities: ['Gym', 'Swimming Pool', 'Parking'],
  totalFields: 7,
  completedFields: 7,
};

const MOCK_APARTMENT_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
];

// ─── Shared animated pressable ─────────────────────────────

function PressableButton({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── No image placeholder ──────────────────────────────────

function NoImagePlaceholder() {
  return (
    <View style={styles.noImageBox}>
      <Upload size={32} color={colors.neutral[300]} />
      <Text style={styles.noImageText}>No images uploaded</Text>
    </View>
  );
}

// ─── Image gallery ─────────────────────────────────────────

function ImageGallery({ images }: { images: string[] }) {
  if (images.length === 1) {
    return (
      <View style={styles.galleryContainer}>
        <Image source={{ uri: images[0] }} style={styles.gallerySingle} />
      </View>
    );
  }

  return (
    <View style={styles.galleryContainer}>
      <View style={styles.galleryGrid}>
        <Image source={{ uri: images[0] }} style={styles.galleryLeft} />
        <View style={styles.galleryRight}>
          {images[1] && (
            <Image source={{ uri: images[1] }} style={styles.galleryRightImg} />
          )}
          {images.length > 2 && (
            <View style={styles.galleryMoreWrapper}>
              <Image source={{ uri: images[2] }} style={styles.galleryRightImg} />
              {images.length > 3 && (
                <View style={styles.galleryOverlay}>
                  <Text style={styles.galleryOverlayText}>
                    +{images.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────

export default function PreviewListingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ withImages?: string }>();

  const listing = MOCK_LISTING;
  const images = params.withImages === '1' ? MOCK_APARTMENT_IMAGES : [];
  const hasImages = images.length > 0;
  const completionPercent = Math.round(
    (listing.completedFields / listing.totalFields) * 100
  );

  const handlePostListing = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: submit listing to backend
    // Navigate back to tabs
    router.dismissAll();
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.neutral[800]} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>List Your Property By Voice</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BOTTOM_BAR_HEIGHT + insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section title */}
        <Animated.View entering={FadeIn.duration(300)}>
          <Text style={styles.sectionTitle}>Preview Your Listing</Text>
        </Animated.View>

        {/* Listing card */}
        <Animated.View entering={SlideInDown.duration(400).delay(100)} style={styles.listingCard}>
          {/* Image area */}
          {hasImages ? (
            <ImageGallery images={images} />
          ) : (
            <NoImagePlaceholder />
          )}

          {/* Details */}
          <View style={styles.detailsSection}>
            {/* Title */}
            <Text style={styles.listingTitle}>{listing.title}</Text>

            {/* Location */}
            <View style={styles.detailRow}>
              <MapPin size={14} color={colors.neutral[400]} />
              <Text style={styles.detailText}>{listing.location}</Text>
            </View>

            {/* Building */}
            <View style={styles.detailRow}>
              <Building size={14} color={colors.neutral[400]} />
              <Text style={styles.detailText}>{listing.building}</Text>
            </View>

            {/* Area + Category */}
            <View style={styles.specRow}>
              <View style={styles.specItem}>
                <Maximize size={13} color={colors.neutral[400]} />
                <Text style={styles.specText}>{listing.area}</Text>
              </View>
              <View style={styles.specItem}>
                <Home size={13} color={colors.neutral[400]} />
                <Text style={styles.specText}>{listing.category}</Text>
              </View>
            </View>

            {/* Price */}
            <Text style={styles.priceText}>
              <Text style={styles.rupeeSymbol}>{'\u20B9'}</Text>
              {listing.price}
            </Text>

            {/* Amenities */}
            <View style={styles.amenitiesSection}>
              <Text style={styles.amenitiesLabel}>Amenities:</Text>
              <View style={styles.amenityChips}>
                {listing.amenities.map((a) => (
                  <View key={a} style={styles.amenityChip}>
                    <Text style={styles.amenityChipText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Completion row */}
            <View style={styles.completionRow}>
              <View style={styles.completionLeft}>
                <CheckCircle2
                  size={18}
                  color={colors.success}
                  fill={colors.success}
                />
                <Text style={styles.completionText}>
                  {listing.completedFields} of {listing.totalFields} fields completed
                </Text>
              </View>
              <Text style={styles.completionPercent}>{completionPercent}%</Text>
            </View>
          </View>
        </Animated.View>

        {/* Note banner */}
        <Animated.View entering={SlideInDown.duration(400).delay(200)} style={styles.noteBanner}>
          <Info size={16} color={colors.accent[600]} />
          <Text style={styles.noteText}>
            <Text style={styles.noteBold}>Note: </Text>
            Your listing will be reviewed and published within 2-3 hours. We'll send you a notification once it's live!
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <PressableButton onPress={handlePostListing} style={styles.postBtnWrapper}>
          <LinearGradient
            colors={[colors.primary[600], colors.primary[800]]}
            style={styles.postBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.postBtnText}>Post Listing</Text>
          </LinearGradient>
        </PressableButton>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },

  // Section title
  sectionTitle: {
    fontFamily: fontFamilies.headingExtrabold,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    color: colors.neutral[900],
  },

  // Listing card
  listingCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // No image placeholder
  noImageBox: {
    height: 180,
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  noImageText: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[400],
  },

  // Image gallery
  galleryContainer: {
    height: 200,
    overflow: 'hidden',
  },
  gallerySingle: {
    width: '100%',
    height: '100%',
  },
  galleryGrid: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
  },
  galleryLeft: {
    flex: 1,
    height: '100%',
  },
  galleryRight: {
    flex: 1,
    gap: 2,
  },
  galleryRightImg: {
    flex: 1,
    width: '100%',
  },
  galleryMoreWrapper: {
    flex: 1,
    position: 'relative',
  },
  galleryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryOverlayText: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xl,
    color: colors.white,
  },

  // Details section
  detailsSection: {
    padding: 18,
    gap: 8,
  },
  listingTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    color: colors.neutral[900],
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[600],
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[700],
  },

  // Price
  priceText: {
    fontFamily: fontFamilies.headingExtrabold,
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights['2xl'],
    color: colors.neutral[900],
    marginTop: 4,
  },
  rupeeSymbol: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xl,
  },

  // Amenities
  amenitiesSection: {
    marginTop: 4,
    gap: 8,
  },
  amenitiesLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
  },
  amenityChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  amenityChipText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[700],
  },

  // Completion
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  completionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completionText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[700],
  },
  completionPercent: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.success,
  },

  // Note banner
  noteBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.accent[50],
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.accent[100],
  },
  noteText: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.base,
    color: colors.neutral[700],
  },
  noteBold: {
    fontFamily: fontFamilies.headingSemibold,
    color: colors.accent[700],
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  postBtnWrapper: {
    alignSelf: 'stretch',
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
  },
  postBtnText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.white,
    letterSpacing: 0.3,
  },
});
