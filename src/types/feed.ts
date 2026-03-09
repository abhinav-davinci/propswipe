import type { Property } from './property';
import type { Insight, NewsItem, MarketPulse, NeighbourhoodChapter, VideoReel } from './insight';

export type FeedItemType = 'property' | 'insight' | 'news' | 'market_pulse' | 'neighbourhood' | 'video_reel';

export type FeedItem =
  | { type: 'property'; data: Property }
  | { type: 'insight'; data: Insight }
  | { type: 'news'; data: NewsItem }
  | { type: 'market_pulse'; data: MarketPulse }
  | { type: 'neighbourhood'; data: NeighbourhoodChapter }
  | { type: 'video_reel'; data: VideoReel };
