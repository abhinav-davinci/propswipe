import type { Property } from './property';
import type { Insight, NewsItem, MarketPulse, NeighbourhoodChapter } from './insight';

export type FeedItemType = 'property' | 'insight' | 'news' | 'market_pulse' | 'neighbourhood';

export type FeedItem =
  | { type: 'property'; data: Property }
  | { type: 'insight'; data: Insight }
  | { type: 'news'; data: NewsItem }
  | { type: 'market_pulse'; data: MarketPulse }
  | { type: 'neighbourhood'; data: NeighbourhoodChapter };
