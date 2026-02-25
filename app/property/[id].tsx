import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft, Heart, Share2, MapPin, Bed, Bath, Maximize2, Building2,
  Compass, Armchair, Sparkles, Phone, Star, ShieldCheck, ChevronRight,
} from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MatchScoreBadge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { usePropertyStore } from '../../src/stores/propertyStore';
import { mockProperties } from '../../src/mocks/properties';
import { formatCurrency } from '../../src/utils/formatCurrency';
import { colors } from '../../src/theme/colors';

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

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isPropertySaved, saveProperty, unsaveProperty } = usePropertyStore();
  const [imageIndex, setImageIndex] = useState(0);

  const property = mockProperties.find((p) => p.id === id) ?? mockProperties[0];
  const saved = isPropertySaved(property.id);

  const imageHeight = Math.min(Math.round(screenHeight * 0.38), 320);

  const toggleSave = () => {
    if (saved) unsaveProperty(property.id);
    else saveProperty(property);
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
        {/* Image Carousel */}
        <View style={{ height: imageHeight, position: 'relative' }}>
          <FlatList
            data={property.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setImageIndex(Math.round(e.nativeEvent.contentOffset.x / screenWidth));
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={{ width: screenWidth, height: imageHeight }} contentFit="cover" />
            )}
            keyExtractor={(_, i) => String(i)}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.3)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0">
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
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
            {property.images.map((_, i) => (
              <View key={i} className={`w-2 h-2 rounded-full ${i === imageIndex ? 'bg-white' : 'bg-white/40'}`} />
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
    </View>
  );
}
