import React from 'react';
import { useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { SwipeOverlay } from './SwipeOverlay';
import { PropertyCard } from '../cards/PropertyCard';
import { InsightCard } from '../cards/InsightCard';
import { NewsShortCard } from '../cards/NewsShortCard';
import { MarketPulseCard } from '../cards/MarketPulseCard';
import { NeighbourhoodChapterCard } from '../cards/NeighbourhoodChapterCard';
import { VideoReelCard } from '../cards/VideoReelCard';
import type { FeedItem } from '../../types/feed';
import type { SwipeDirection } from '../../types/property';

interface SwipeableCardProps {
  item: FeedItem;
  onSwipe: (direction: SwipeDirection) => void;
  onTap?: () => void;
  onProgrammaticSwipe?: (swipe: (direction: SwipeDirection) => void) => void;
}

export function SwipeableCard({ item, onSwipe, onTap, onProgrammaticSwipe }: SwipeableCardProps) {
  const { width } = useWindowDimensions();
  const {
    gesture,
    cardStyle,
    likeOpacity,
    nopeOpacity,
    superlikeOpacity,
    programmaticSwipe,
    translateX,
    translateY,
  } = useSwipeGesture({ onSwipe, onTap });

  React.useEffect(() => {
    onProgrammaticSwipe?.(programmaticSwipe);
  }, [programmaticSwipe]);

  const renderContent = () => {
    switch (item.type) {
      case 'property':
        return <PropertyCard property={item.data} />;
      case 'insight':
        return <InsightCard insight={item.data} />;
      case 'news':
        return <NewsShortCard news={item.data} />;
      case 'market_pulse':
        return <MarketPulseCard data={item.data} />;
      case 'neighbourhood':
        return <NeighbourhoodChapterCard chapter={item.data} />;
      case 'video_reel':
        return <VideoReelCard reel={item.data} />;
    }
  };

  const isProperty = item.type === 'property';

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[cardStyle, { width: width - 32, alignSelf: 'center' }]}
      >
        {isProperty && (
          <SwipeOverlay
            likeOpacity={likeOpacity}
            nopeOpacity={nopeOpacity}
            superlikeOpacity={superlikeOpacity}
            translateX={translateX}
            translateY={translateY}
          />
        )}
        {renderContent()}
      </Animated.View>
    </GestureDetector>
  );
}
