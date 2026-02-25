import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Heart, Star, MapPin, Bed, Maximize2, Trash2, GitCompareArrows } from 'lucide-react-native';
import { SafeScreen } from '../../src/components/layout/SafeScreen';
import { MatchScoreBadge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { usePropertyStore } from '../../src/stores/propertyStore';
import { formatCurrency } from '../../src/utils/formatCurrency';
import { colors } from '../../src/theme/colors';
import type { Property } from '../../src/types/property';

type Tab = 'saved' | 'superliked';

function PropertyListItem({ property, onPress, onRemove, onCompare }: {
  property: Property;
  onPress: () => void;
  onRemove: () => void;
  onCompare: () => void;
}) {
  const { width } = useWindowDimensions();
  const imageSize = Math.min(Math.round(width * 0.28), 120);

  return (
    <Pressable onPress={onPress} className="bg-white rounded-lg overflow-hidden mb-3 shadow-sm border border-neutral-100">
      <View className="flex-row">
        <Image
          source={{ uri: property.images[0] }}
          style={{ width: imageSize, height: imageSize + 10 }}
          contentFit="cover"
        />
        <View className="flex-1 p-3 justify-between">
          <View>
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-base font-heading text-neutral-900 flex-1 mr-2" numberOfLines={1}>
                {property.title}
              </Text>
              <MatchScoreBadge score={property.matchScore} size="sm" />
            </View>
            <View className="flex-row items-center mb-1">
              <MapPin size={12} color={colors.neutral[500]} />
              <Text className="text-xs font-body text-neutral-500 ml-1">{property.location.area}</Text>
            </View>
            <Text className="text-lg font-heading-semibold text-primary-600">
              {property.transactionType === 'rent'
                ? `₹${(property.price / 1000).toFixed(0)}K/mo`
                : formatCurrency(property.price)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center">
                <Bed size={12} color={colors.neutral[500]} />
                <Text className="text-xs font-body text-neutral-500 ml-1">{property.specs.bedrooms}BHK</Text>
              </View>
              <View className="flex-row items-center">
                <Maximize2 size={12} color={colors.neutral[500]} />
                <Text className="text-xs font-body text-neutral-500 ml-1">{property.specs.carpetArea}sqft</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable onPress={onCompare} className="p-1">
                <GitCompareArrows size={16} color={colors.primary[600]} />
              </Pressable>
              <Pressable onPress={onRemove} className="p-1">
                <Trash2 size={16} color={colors.error} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function SavedScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const { savedProperties, superLiked, unsaveProperty, addToCompare, compareList } = usePropertyStore();

  const properties = activeTab === 'saved' ? savedProperties : superLiked;

  return (
    <SafeScreen>
      <View className="px-4 py-2">
        <Text className="text-2xl font-heading-extrabold text-neutral-900">Saved</Text>
      </View>

      {/* Tab Toggle */}
      <View className="flex-row mx-4 bg-neutral-100 rounded-md p-1 mb-3">
        <Pressable
          onPress={() => setActiveTab('saved')}
          className={`flex-1 flex-row items-center justify-center py-2 rounded-md ${
            activeTab === 'saved' ? 'bg-white shadow-sm' : ''
          }`}
        >
          <Heart size={16} color={activeTab === 'saved' ? colors.primary[600] : colors.neutral[500]} />
          <Text className={`text-sm font-heading-semibold ml-1.5 ${
            activeTab === 'saved' ? 'text-primary-600' : 'text-neutral-500'
          }`}>
            Saved ({savedProperties.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('superliked')}
          className={`flex-1 flex-row items-center justify-center py-2 rounded-md ${
            activeTab === 'superliked' ? 'bg-white shadow-sm' : ''
          }`}
        >
          <Star size={16} color={activeTab === 'superliked' ? colors.accent[500] : colors.neutral[500]} />
          <Text className={`text-sm font-heading-semibold ml-1.5 ${
            activeTab === 'superliked' ? 'text-accent-500' : 'text-neutral-500'
          }`}>
            Super Liked ({superLiked.length})
          </Text>
        </Pressable>
      </View>

      {/* Compare bar */}
      {compareList.length > 0 && (
        <View className="mx-4 mb-3 p-3 bg-primary-50 rounded-md flex-row items-center justify-between">
          <Text className="text-sm font-body-medium text-primary-700">
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

      {/* Property List */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {properties.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-5xl mb-4">{activeTab === 'saved' ? '💚' : '⭐'}</Text>
            <Text className="text-lg font-heading text-neutral-900 mb-2">
              No {activeTab === 'saved' ? 'saved' : 'super liked'} properties yet
            </Text>
            <Text className="text-sm font-body text-neutral-500 text-center px-8">
              Swipe right on properties you like to save them here
            </Text>
          </View>
        ) : (
          properties.map((property) => (
            <PropertyListItem
              key={property.id}
              property={property}
              onPress={() => router.push(`/property/${property.id}`)}
              onRemove={() => unsaveProperty(property.id)}
              onCompare={() => addToCompare(property)}
            />
          ))
        )}
      </ScrollView>
    </SafeScreen>
  );
}
