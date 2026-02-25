import { useEffect, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useFeedStore } from '../stores/feedStore';
import { usePropertyStore } from '../stores/propertyStore';
import { useProfileStore } from '../stores/profileStore';
import { generateFeed, generateMoreProperties } from '../mocks/feedGenerator';
import type { SwipeDirection } from '../types/property';
import type { FeedItem } from '../types/feed';

export function useCardDeck() {
  const { cards, currentIndex, setCards, addCards, advanceCard, addSwipeAction } = useFeedStore();
  const { saveProperty, superLikeProperty, passProperty } = usePropertyStore();
  const { incrementSwipes, incrementSaved } = useProfileStore();

  useEffect(() => {
    if (cards.length === 0) {
      const feed = generateFeed();
      setCards(feed);
    }
  }, []);

  // Load more cards when approaching the end
  useEffect(() => {
    if (cards.length - currentIndex < 5 && cards.length > 0) {
      const more = generateMoreProperties(10);
      addCards(more);
    }
  }, [currentIndex, cards.length]);

  const currentCard: FeedItem | undefined = cards[currentIndex];
  const nextCards = cards.slice(currentIndex + 1, currentIndex + 3);

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      const card = cards[currentIndex];
      if (!card) return;

      if (card.type === 'property') {
        const property = card.data;

        addSwipeAction({
          propertyId: property.id,
          direction,
          timestamp: Date.now(),
        });

        incrementSwipes();

        switch (direction) {
          case 'right':
            saveProperty(property);
            incrementSaved();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'superlike':
            superLikeProperty(property);
            incrementSaved();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'left':
            passProperty(property.id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
        }
      }

      advanceCard();
    },
    [currentIndex, cards]
  );

  return {
    currentCard,
    nextCards,
    currentIndex,
    totalCards: cards.length,
    handleSwipe,
  };
}
