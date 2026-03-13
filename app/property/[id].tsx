import React, { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions, FlatList, Modal, StatusBar, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft, Heart, Share2, MapPin, Bed, Bath, Maximize2, Building2,
  Compass, Armchair, Sparkles, Phone, Star, ShieldCheck, ChevronRight, X,
  MessageCircle, Film,
} from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MatchScoreBadge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { VideoSlide } from '../../src/components/media/VideoSlide';
import { usePropertyStore } from '../../src/stores/propertyStore';
import { useChatStore } from '../../src/stores/chatStore';
import { mockProperties } from '../../src/mocks/properties';
import { formatCurrency } from '../../src/utils/formatCurrency';
import { colors } from '../../src/theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../src/theme/typography';

function MatchBreakdownBar({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-row items-center mb-2">
      <Text className="text-sm font-body text-neutral-600 w-28">{label}</Text>
      <View className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden mr-2">
        <View className="h-full bg-primary-500 rounded-full" style={{ width: `${value}%` }} />
      </View>
      <Text className="text-sm font-heading-semibold text-neutral-700 w-10 text-right">{value}%</Text>
    </View>
  );
}

// ─── Fullscreen image viewer ────────────────────────────────

function FullscreenImageViewer({
  visible,
  images,
  initialIndex,
  onClose,
}: {
  visible: boolean;
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const translateY = useSharedValue(0);
  const backdropOpacity = useSharedValue(1);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  // Drag down to dismiss
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
        backdropOpacity.value = interpolate(
          e.translationY,
          [0, screenHeight * 0.35],
          [1, 0.2],
          Extrapolation.CLAMP,
        );
      }
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        translateY.value = withTiming(screenHeight, { duration: 250 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
        backdropOpacity.value = withSpring(1, { damping: 20 });
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Reset state when opening
  React.useEffect(() => {
    if (visible) {
      translateY.value = 0;
      backdropOpacity.value = 1;
      setActiveIndex(initialIndex);
      // Scroll to the initial image
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 50);
    }
  }, [visible, initialIndex]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, backdropStyle]}
      />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{ flex: 1, justifyContent: 'center' }, containerStyle]}>
          {/* Image carousel */}
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setActiveIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <View style={{ width: screenWidth, height: screenHeight, justifyContent: 'center' }}>
                <Image
                  source={{ uri: item }}
                  style={{ width: screenWidth, height: screenWidth * 0.75 }}
                  contentFit="contain"
                />
              </View>
            )}
            keyExtractor={(_, i) => String(i)}
          />

          {/* Top bar */}
          <View style={{
            position: 'absolute',
            top: insets.top + 12,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}>
            {/* Counter */}
            <View style={fs.counterPill}>
              <Text style={fs.counterText}>{activeIndex + 1} / {images.length}</Text>
            </View>

            {/* Close */}
            <Pressable onPress={handleClose} hitSlop={12} style={fs.closeBtn}>
              <X size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Bottom dots */}
          {images.length > 1 && (
            <View style={fs.dotsRow}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    fs.dot,
                    i === activeIndex ? fs.dotActive : fs.dotInactive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Drag indicator */}
          <View style={{
            position: 'absolute',
            bottom: insets.bottom + 8,
            alignSelf: 'center',
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.3)',
          }} />
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}

const fs = StyleSheet.create({
  counterPill: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    color: '#fff',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotActive: {
    backgroundColor: '#fff',
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});

// ─── Main screen ──────────────────────────────────────────

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isPropertySaved, saveProperty, unsaveProperty } = usePropertyStore();
  const { createConversation, getConversationByPropertyId } = useChatStore();
  const [imageIndex, setImageIndex] = useState(0);

  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const mainCarouselRef = useRef<ScrollView>(null);

  const property = mockProperties.find((p) => p.id === id) ?? mockProperties[0];
  const saved = isPropertySaved(property.id);

  const imageHeight = Math.min(Math.round(screenHeight * 0.38), 320);

  // Build carousel slides: hero image, then video (if any), then remaining images
  type DetailSlide = { type: 'image'; uri: string } | { type: 'video' };
  const detailSlides: DetailSlide[] = [];
  detailSlides.push({ type: 'image', uri: property.images[0] });
  if (property.videoTour) {
    detailSlides.push({ type: 'video' });
  }
  for (let i = 1; i < property.images.length; i++) {
    detailSlides.push({ type: 'image', uri: property.images[i] });
  }

  const openFullscreen = useCallback((index: number) => {
    // Only open fullscreen for image slides
    const slide = detailSlides[index];
    if (slide?.type === 'video') return;
    // Map carousel index to images-only index for fullscreen viewer
    const imageOnlyIndex = detailSlides.slice(0, index).filter((s) => s.type === 'image').length;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFullscreenIndex(imageOnlyIndex);
    setShowFullscreen(true);
  }, [property.images, property.videoTour]);

  const toggleSave = () => {
    if (saved) unsaveProperty(property.id);
    else saveProperty(property);
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
        {/* Image/Video Carousel */}
        <View style={{ height: imageHeight, position: 'relative' }}>
          <ScrollView
            ref={mainCarouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onMomentumScrollEnd={(e) => {
              setImageIndex(Math.round(e.nativeEvent.contentOffset.x / screenWidth));
            }}
          >
            {detailSlides.map((slide, index) =>
              slide.type === 'video' && property.videoTour ? (
                <VideoSlide
                  key="video"
                  videoTour={property.videoTour}
                  width={screenWidth}
                  height={imageHeight}
                  isActive={imageIndex === index}
                />
              ) : slide.type === 'image' ? (
                <Pressable key={`img-${index}`} onPress={() => openFullscreen(index)}>
                  <Image source={{ uri: slide.uri }} style={{ width: screenWidth, height: imageHeight }} contentFit="cover" />
                </Pressable>
              ) : null
            )}
          </ScrollView>
          {detailSlides[imageIndex]?.type !== 'video' && (
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.3)']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              pointerEvents="none"
            />
          )}
          <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0" pointerEvents="box-none">
            <View className="flex-row items-center justify-between px-4 py-2">
              <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-full bg-black/30 items-center justify-center">
                <ChevronLeft size={24} color="white" />
              </Pressable>
              <View className="flex-row gap-2">
                <Pressable onPress={toggleSave} className="w-10 h-10 rounded-full bg-black/30 items-center justify-center">
                  <Heart size={20} color="white" fill={saved ? 'white' : 'transparent'} />
                </Pressable>
                <Pressable className="w-10 h-10 rounded-full bg-black/30 items-center justify-center">
                  <Share2 size={20} color="white" />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
          {/* Dot indicators */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5" pointerEvents="none">
            {detailSlides.map((slide, i) => (
              <View
                key={i}
                style={[
                  { width: 8, height: 8, borderRadius: 4 },
                  i === imageIndex
                    ? { backgroundColor: '#fff' }
                    : { backgroundColor: 'rgba(255,255,255,0.4)' },
                  slide.type === 'video' && { width: 12, borderRadius: 3 },
                ]}
              />
            ))}
          </View>
        </View>

        <View className="px-4 pt-4">
          {/* Price and Match Score */}
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-2xl font-heading-extrabold text-neutral-900">
                {property.transactionType === 'rent' ? `₹${(property.price / 1000).toFixed(0)}K/mo` : formatCurrency(property.price)}
              </Text>
              {property.pricePerSqft > 0 && (
                <Text className="text-sm font-body text-neutral-500">₹{property.pricePerSqft.toLocaleString('en-IN')}/sq.ft</Text>
              )}
            </View>
            <MatchScoreBadge score={property.matchScore} size="lg" />
          </View>

          <Text className="text-xl font-heading text-neutral-900 mb-1">{property.title}</Text>
          <View className="flex-row items-center mb-4">
            <MapPin size={14} color={colors.neutral[500]} />
            <Text className="text-sm font-body text-neutral-500 ml-1">
              {property.location.area}, {property.location.subArea}, {property.location.city}
            </Text>
          </View>

          {/* Specs Grid */}
          <View className="flex-row flex-wrap gap-3 mb-6">
            {[
              { icon: <Bed size={18} color={colors.primary[600]} />, label: `${property.specs.bedrooms} BHK` },
              { icon: <Bath size={18} color={colors.primary[600]} />, label: `${property.specs.bathrooms} Bath` },
              { icon: <Maximize2 size={18} color={colors.primary[600]} />, label: `${property.specs.carpetArea} sqft` },
              { icon: <Building2 size={18} color={colors.primary[600]} />, label: `Floor ${property.specs.floor}/${property.specs.totalFloors}` },
              { icon: <Compass size={18} color={colors.primary[600]} />, label: property.specs.facing },
              { icon: <Armchair size={18} color={colors.primary[600]} />, label: property.specs.furnishing },
            ].map(({ icon, label }) => (
              <View key={label} className="flex-row items-center bg-primary-50 rounded-md px-3 py-2">
                {icon}
                <Text className="text-sm font-body-medium text-primary-800 ml-2 capitalize">{label}</Text>
              </View>
            ))}
          </View>

          {/* AI Summary */}
          <View className="bg-primary-50 rounded-lg p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Sparkles size={16} color={colors.primary[600]} />
              <Text className="text-sm font-heading-semibold text-primary-700 ml-2">AI Insight</Text>
            </View>
            <Text className="text-sm font-body text-primary-800 leading-5">{property.aiSummary}</Text>
          </View>

          {/* Match Breakdown */}
          <Text className="text-lg font-heading text-neutral-900 mb-3">Match Breakdown</Text>
          <View className="bg-white rounded-lg p-4 mb-6 border border-neutral-100">
            <MatchBreakdownBar label="Location" value={property.matchBreakdown.location} />
            <MatchBreakdownBar label="Budget" value={property.matchBreakdown.budget} />
            <MatchBreakdownBar label="Size" value={property.matchBreakdown.size} />
            <MatchBreakdownBar label="Amenities" value={property.matchBreakdown.amenities} />
            <MatchBreakdownBar label="Connectivity" value={property.matchBreakdown.connectivity} />
            <MatchBreakdownBar label="Value" value={property.matchBreakdown.value} />
          </View>

          {/* Amenities */}
          <Text className="text-lg font-heading text-neutral-900 mb-3">Amenities</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {property.specs.amenities.map((amenity) => (
              <View key={amenity} className="bg-white border border-neutral-200 rounded-md px-3 py-2">
                <Text className="text-sm font-body text-neutral-700">{amenity}</Text>
              </View>
            ))}
          </View>

          {/* Agent Card */}
          <Text className="text-lg font-heading text-neutral-900 mb-3">Listed By</Text>
          <Pressable
            onPress={() => router.push(`/agent/${property.agent.id}`)}
            className="bg-white rounded-lg p-4 mb-6 border border-neutral-100 flex-row items-center"
          >
            <Image source={{ uri: property.agent.image }} style={{ width: 48, height: 48, borderRadius: 24 }} />
            <View className="flex-1 ml-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-heading-semibold text-neutral-900">{property.agent.name}</Text>
                {property.agent.verified && <ShieldCheck size={14} color={colors.primary[600]} />}
              </View>
              <View className="flex-row items-center mt-0.5">
                <Star size={12} color={colors.accent[500]} fill={colors.accent[500]} />
                <Text className="text-sm font-body text-neutral-600 ml-1">{property.agent.rating}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.neutral[400]} />
          </Pressable>

          {/* Message Agent Button */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const existing = getConversationByPropertyId(property.id);
              if (existing) {
                router.push(`/chat/${existing.id}`);
              } else {
                const convId = createConversation(property);
                router.push(`/chat/${convId}`);
              }
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: colors.primary[50],
              borderWidth: 1,
              borderColor: colors.primary[200],
              borderRadius: 12,
              paddingVertical: 14,
              marginBottom: 24,
            }}
          >
            <MessageCircle size={18} color={colors.primary[600]} />
            <Text style={{
              fontFamily: fontFamilies.headingSemibold,
              fontSize: fontSizes.base,
              color: colors.primary[700],
            }}>
              Message Agent
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <View className="flex-row gap-3">
          <Button
            title="Call Agent"
            onPress={() => {}}
            variant="outline"
            icon={<Phone size={18} color={colors.neutral[700]} />}
            className="flex-1"
          />
          <Button
            title={saved ? 'Saved' : 'Save Property'}
            onPress={toggleSave}
            variant={saved ? 'secondary' : 'primary'}
            icon={<Heart size={18} color={saved ? colors.primary[600] : 'white'} fill={saved ? colors.primary[600] : 'transparent'} />}
            className="flex-1"
          />
        </View>
      </View>

      <FullscreenImageViewer
        visible={showFullscreen}
        images={property.images}
        initialIndex={fullscreenIndex}
        onClose={() => {
          setShowFullscreen(false);
        }}
      />
    </View>
  );
}
