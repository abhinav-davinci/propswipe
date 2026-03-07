import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  SlideInDown,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  X,
  ImagePlus,
  Camera,
  Trash2,
  Check,
  AlertCircle,
  Star,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../src/theme/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MAX_IMAGES = 10;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const BOTTOM_BAR_HEIGHT = 120;

interface SelectedImage {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  id: string;
}

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

// ─── Empty state ───────────────────────────────────────────

function EmptyUploadZone({ onPickImages }: { onPickImages: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Pressable style={styles.emptyZone} onPress={onPickImages}>
        <View style={styles.emptyIconCircle}>
          <ImagePlus size={28} color={colors.primary[500]} />
        </View>
        <Text style={styles.emptyTitle}>
          Make your listing stand out!
        </Text>
        <Text style={styles.emptySubtitle}>
          Tap to upload images of your property
        </Text>

        <View style={styles.uploadBtn}>
          <Camera size={16} color={colors.primary[600]} />
          <Text style={styles.uploadBtnText}>Upload Images</Text>
        </View>

        <Text style={styles.emptyHint}>
          Upload images to get better visibility for your property
        </Text>
        <Text style={styles.emptyConstraint}>
          Max {MAX_FILE_SIZE_MB}MB each  ·  Up to {MAX_IMAGES} images
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Image thumbnail ───────────────────────────────────────

function ImageThumbnail({
  image,
  index,
  isCover,
  onRemove,
  onSetCover,
}: {
  image: SelectedImage;
  index: number;
  isCover: boolean;
  onRemove: () => void;
  onSetCover: () => void;
}) {
  return (
    <Animated.View
      entering={FadeIn.duration(300).delay(index * 50)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify().damping(18).stiffness(150)}
      style={[styles.thumbContainer, isCover && styles.thumbContainerCover]}
    >
      <Pressable onPress={onSetCover} onLongPress={onRemove}>
        <Image source={{ uri: image.uri }} style={styles.thumbImage} />

        {/* Cover badge */}
        {isCover && (
          <View style={styles.coverBadge}>
            <Star size={10} color={colors.white} fill={colors.white} />
            <Text style={styles.coverBadgeText}>Cover</Text>
          </View>
        )}

        {/* Remove button */}
        <Pressable
          style={styles.removeBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRemove();
          }}
          hitSlop={8}
        >
          <X size={12} color={colors.white} strokeWidth={3} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ───────────────────────────────────────────

export default function UploadPhotosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [images, setImages] = useState<SelectedImage[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const clearErrors = useCallback(() => {
    if (errors.length > 0) setErrors([]);
  }, [errors]);

  const requestPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library in Settings to upload images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }, []);

  const handlePickImages = useCallback(async () => {
    clearErrors();
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setErrors([`Maximum ${MAX_IMAGES} images allowed`]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.8,
        exif: false,
      });

      if (result.canceled) {
        setIsLoading(false);
        return;
      }

      const newErrors: string[] = [];
      const validImages: SelectedImage[] = [];

      for (const asset of result.assets) {
        // Check file size
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
          const sizeMB = (asset.fileSize / (1024 * 1024)).toFixed(1);
          newErrors.push(`Image skipped (${sizeMB}MB exceeds ${MAX_FILE_SIZE_MB}MB limit)`);
          continue;
        }

        // Check for duplicates
        const isDuplicate = images.some((img) => img.uri === asset.uri);
        if (isDuplicate) {
          newErrors.push('Duplicate image skipped');
          continue;
        }

        validImages.push({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize ?? undefined,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        });
      }

      if (validImages.length > 0) {
        setImages((prev) => [...prev, ...validImages]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (newErrors.length > 0) {
        setErrors(newErrors);
      }
    } catch {
      setErrors(['Failed to pick images. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  }, [images, requestPermission, clearErrors]);

  const handleRemoveImage = useCallback(
    (index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setImages((prev) => prev.filter((_, i) => i !== index));
      // Adjust cover index
      if (index === coverIndex) {
        setCoverIndex(0);
      } else if (index < coverIndex) {
        setCoverIndex((prev) => prev - 1);
      }
      clearErrors();
    },
    [coverIndex, clearErrors]
  );

  const handleSetCover = useCallback(
    (index: number) => {
      if (index !== coverIndex) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCoverIndex(index);
      }
    },
    [coverIndex]
  );

  const handleContinue = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push(`/listing/ai-video?photoCount=${images.length}`);
  }, [router, images.length]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const hasImages = images.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={colors.neutral[800]} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Upload Photos</Text>
        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BOTTOM_BAR_HEIGHT + insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Upload images of your property</Text>
          <Text style={styles.pageSubtitle}>
            Buyers fall in love with what they see first. Photos make your listing stand out and attract serious interest.
          </Text>
        </View>

        {/* Error banners */}
        {errors.map((err, i) => (
          <Animated.View
            key={`${err}-${i}`}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.errorBanner}
          >
            <AlertCircle size={16} color={colors.error} />
            <Text style={styles.errorText}>{err}</Text>
            <Pressable
              onPress={() => setErrors((prev) => prev.filter((_, idx) => idx !== i))}
              hitSlop={8}
            >
              <X size={14} color={colors.neutral[400]} />
            </Pressable>
          </Animated.View>
        ))}

        {!hasImages ? (
          <EmptyUploadZone onPickImages={handlePickImages} />
        ) : (
          <>
            {/* Image count + add more */}
            <Animated.View entering={FadeIn.duration(300)} style={styles.gridHeader}>
              <Text style={styles.gridCount}>
                {images.length} of {MAX_IMAGES} images
              </Text>
              {images.length < MAX_IMAGES && (
                <Pressable
                  style={styles.addMoreBtn}
                  onPress={handlePickImages}
                >
                  <ImagePlus size={14} color={colors.primary[600]} />
                  <Text style={styles.addMoreText}>Add More</Text>
                </Pressable>
              )}
            </Animated.View>

            {/* Image grid */}
            <View style={styles.imageGrid}>
              {images.map((image, index) => (
                <ImageThumbnail
                  key={image.id}
                  image={image}
                  index={index}
                  isCover={index === coverIndex}
                  onRemove={() => handleRemoveImage(index)}
                  onSetCover={() => handleSetCover(index)}
                />
              ))}

              {/* Add more tile */}
              {images.length < MAX_IMAGES && (
                <Animated.View entering={FadeIn.duration(300)} style={styles.addTile}>
                  <Pressable style={styles.addTileInner} onPress={handlePickImages}>
                    <ImagePlus size={22} color={colors.neutral[400]} />
                  </Pressable>
                </Animated.View>
              )}
            </View>

            {/* Tips */}
            <Animated.View entering={SlideInDown.duration(400).delay(200)} style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Tips for great photos</Text>
              <View style={styles.tipRow}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>
                  Use natural lighting — shoot during daytime
                </Text>
              </View>
              <View style={styles.tipRow}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>
                  Capture all rooms, bathrooms, balcony, and parking
                </Text>
              </View>
              <View style={styles.tipRow}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>
                  Tap any image to set it as cover photo
                </Text>
              </View>
            </Animated.View>
          </>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary[600]} />
            <Text style={styles.loadingText}>Processing images...</Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <PressableButton
          onPress={hasImages ? handleContinue : handlePickImages}
          style={styles.continueBtnWrapper}
        >
          <LinearGradient
            colors={
              hasImages
                ? [colors.primary[600], colors.primary[800]]
                : [colors.neutral[300], colors.neutral[400]]
            }
            style={styles.continueBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {hasImages ? (
              <>
                <Check size={18} color={colors.white} strokeWidth={2.5} />
                <Text style={styles.continueBtnText}>
                  Continue with {images.length} photo{images.length > 1 ? 's' : ''}
                </Text>
              </>
            ) : (
              <>
                <Camera size={18} color={colors.white} strokeWidth={2} />
                <Text style={styles.continueBtnText}>Select Photos</Text>
              </>
            )}
          </LinearGradient>
        </PressableButton>
        <Text style={styles.bottomHint}>
          {hasImages
            ? 'You can always add more photos later'
            : "We'll notify you when your listing is live in few hours"}
        </Text>
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
  skipText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },

  // Title
  titleSection: {
    gap: 6,
  },
  pageTitle: {
    fontFamily: fontFamilies.headingExtrabold,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    color: colors.neutral[900],
  },
  pageSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.base,
    color: colors.neutral[500],
  },

  // Error banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.error,
  },

  // Empty state
  emptyZone: {
    borderWidth: 2,
    borderColor: colors.primary[200],
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: colors.primary[50],
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  emptyTitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: 20,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginBottom: 20,
  },
  uploadBtnText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.primary[600],
  },
  emptyHint: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  emptyConstraint: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 4,
  },

  // Grid header
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridCount: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
  },
  addMoreText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.primary[600],
  },

  // Image grid
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  thumbContainer: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbContainerCover: {
    borderColor: colors.primary[500],
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  coverBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary[600],
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  coverBadgeText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 10,
    color: colors.white,
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Add tile
  addTile: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  addTileInner: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
  },

  // Tips
  tipsCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  tipsTitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[800],
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  tipBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.neutral[400],
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.base,
    color: colors.neutral[600],
  },

  // Loading
  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  loadingText: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
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
  continueBtnWrapper: {
    alignSelf: 'stretch',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 14,
  },
  continueBtnText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.white,
    letterSpacing: 0.3,
  },
  bottomHint: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[400],
    marginTop: 10,
  },
});
