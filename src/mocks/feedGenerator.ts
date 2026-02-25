import type { FeedItem } from '../types/feed';
import { mockProperties } from './properties';
import { mockInsights, mockNews, mockMarketPulse, mockNeighbourhoodChapters } from './insights';

/**
 * Generates a mixed feed with property cards and content cards
 * woven in every 3-5 property cards.
 */
export function generateFeed(): FeedItem[] {
  const feed: FeedItem[] = [];
  const contentItems: FeedItem[] = [
    ...mockInsights.map((i): FeedItem => ({ type: 'insight', data: i })),
    ...mockNews.map((n): FeedItem => ({ type: 'news', data: n })),
    ...mockMarketPulse.map((m): FeedItem => ({ type: 'market_pulse', data: m })),
    ...mockNeighbourhoodChapters.map((n): FeedItem => ({ type: 'neighbourhood', data: n })),
  ];

  let contentIndex = 0;
  let propertyCount = 0;

  // Shuffle properties for variety
  const shuffledProperties = [...mockProperties].sort(() => Math.random() - 0.5);

  for (const property of shuffledProperties) {
    feed.push({ type: 'property', data: property });
    propertyCount++;

    // Inject content card every 3 properties
    if (propertyCount % 3 === 0 && contentIndex < contentItems.length) {
      feed.push(contentItems[contentIndex]);
      contentIndex++;
    }
  }

  return feed;
}

/**
 * Generates additional property cards by slightly modifying existing ones.
 */
export function generateMoreProperties(count: number): FeedItem[] {
  return Array.from({ length: count }, (_, i) => {
    const base = mockProperties[i % mockProperties.length];
    return {
      type: 'property' as const,
      data: {
        ...base,
        id: `p-gen-${Date.now()}-${i}`,
        matchScore: Math.max(55, Math.min(99, base.matchScore + Math.floor(Math.random() * 20 - 10))),
        price: Math.round(base.price * (0.85 + Math.random() * 0.3)),
      },
    };
  });
}
