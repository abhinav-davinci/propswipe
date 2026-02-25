import React, { useRef, useCallback } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, Bell } from 'lucide-react-native';
import { SafeScreen } from '../../src/components/layout/SafeScreen';
import { SwipeableCard } from '../../src/components/swipe/SwipeableCard';
import { SwipeActionButtons } from '../../src/components/swipe/SwipeActionButtons';
import { useCardDeck } from '../../src/hooks/useCardDeck';
import { colors } from '../../src/theme/colors';
import type { SwipeDirection } from '../../src/types/property';

export default function DiscoverScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { currentCard, nextCards, currentIndex, totalCards, handleSwipe } = useCardDeck();
  const programmaticSwipeRef = useRef<((direction: SwipeDirection) => void) | null>(null);

  const cardWidth = width - 32;

  const onSwipe = useCallback(
    (direction: SwipeDirection) => {
      handleSwipe(direction);
    },
    [handleSwipe]
  );

  const onCardTap = useCallback(() => {
    if (currentCard?.type === 'property') {
      router.push(`/property/${currentCard.data.id}`);
    }
  }, [currentCard, router]);

  const onActionButton = useCallback(
    (direction: SwipeDirection) => {
      // Detail button navigates directly without animating card away
      if (direction === 'up' && currentCard?.type === 'property') {
        router.push(`/property/${currentCard.data.id}`);
        return;
      }
      if (programmaticSwipeRef.current) {
        programmaticSwipeRef.current(direction);
      }
    },
    [currentCard, router]
  );

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 bg-primary-600 rounded-md items-center justify-center">
            <Text className="text-sm font-heading-extrabold text-white">P</Text>
          </View>
          <Text className="text-xl font-heading-extrabold text-neutral-900">PropSwipe</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center bg-primary-50 rounded-md px-2.5 py-1">
            <Sparkles size={14} color={colors.primary[600]} />
            <Text className="text-xs font-heading-semibold text-primary-600 ml-1">
              {currentIndex + 1}/{totalCards}
            </Text>
          </View>
          <View className="w-8 h-8 rounded-full bg-neutral-100 items-center justify-center">
            <Bell size={18} color={colors.neutral[600]} />
          </View>
        </View>
      </View>

      {/* Card Stack */}
      <View className="flex-1 items-center justify-center px-4">
        {currentCard ? (
          <View className="flex-1 w-full items-center justify-center">
            {/* Background cards (next 2) */}
            {nextCards.map((card, index) => (
              <View
                key={`bg-${currentIndex + index + 1}`}
                className="absolute self-center bg-neutral-200 rounded-lg"
                style={{
                  width: cardWidth - (index + 1) * 16,
                  height: '80%',
                  transform: [
                    { scale: 1 - (index + 1) * 0.04 },
                    { translateY: (index + 1) * 6 },
                  ],
                  opacity: 1 - (index + 1) * 0.25,
                  zIndex: -index - 1,
                }}
              />
            ))}

            {/* Active card */}
            <SwipeableCard
              key={`card-${currentIndex}`}
              item={currentCard}
              onSwipe={onSwipe}
              onTap={onCardTap}
              onProgrammaticSwipe={(fn) => { programmaticSwipeRef.current = fn; }}
            />
          </View>
        ) : (
          <View className="items-center px-8">
            <Text className="text-6xl mb-4">🏡</Text>
            <Text className="text-xl font-heading text-neutral-900 mb-2 text-center">
              You've seen all properties!
            </Text>
            <Text className="text-base font-body text-neutral-500 text-center">
              Check back soon for new matches, or refine your preferences.
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {currentCard?.type === 'property' && (
        <SwipeActionButtons onAction={onActionButton} />
      )}

      {/* Swipe hint for non-property cards */}
      {currentCard && currentCard.type !== 'property' && (
        <View className="items-center py-3">
          <Text className="text-xs font-body text-neutral-400">
            Swipe to continue
          </Text>
        </View>
      )}
    </SafeScreen>
  );
}
