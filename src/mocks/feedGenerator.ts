import type { FeedItem } from '../types/feed';
import { mockProperties } from './properties';
import { mockInsights, mockNews, mockMarketPulse, mockNeighbourhoodChapters, mockVideoReels } from './insights';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildContentPool(): FeedItem[] {
  return shuffle([
    ...mockInsights.map((i): FeedItem => ({ type: 'insight', data: i })),
    ...mockNews.map((n): FeedItem => ({ type: 'news', data: n })),
    ...mockMarketPulse.slice(0, 3).map((m): FeedItem => ({ type: 'market_pulse', data: m })),
    ...mockNeighbourhoodChapters.map((n): FeedItem => ({ type: 'neighbourhood', data: n })),
    ...mockVideoReels.map((v): FeedItem => ({ type: 'video_reel', data: v })),
  ]);
}

// Recycling index so load-more batches continue rotating through content
let contentPool: FeedItem[] = [];
let contentCursor = 0;

function nextContentItem(): FeedItem {
  if (contentPool.length === 0) {
    contentPool = buildContentPool();
  }
  if (contentCursor >= contentPool.length) {
    // Reshuffle and restart
    contentPool = buildContentPool();
    contentCursor = 0;
  }
  return contentPool[contentCursor++];
}

/**
 * Generates a mixed feed — every 2 property cards get 1 content card
 * woven in, ensuring all content types (news, insights, video reels, etc.)
 * appear within the first ~20 cards.
 */
export function generateFeed(): FeedItem[] {
  // Reset pool each time feed is regenerated
  contentPool = buildContentPool();
  contentCursor = 0;

  const feed: FeedItem[] = [];
  const shuffledProperties = shuffle(mockProperties);
  let propertyCount = 0;

  for (const property of shuffledProperties) {
    feed.push({ type: 'property', data: property });
    propertyCount++;

    // Inject a content card every 2 properties
    if (propertyCount % 2 === 0) {
      feed.push(nextContentItem());
    }
  }

  return feed;
}

/**
 * Generates additional cards with content mixed in (every 2 properties).
 */
export function generateMoreProperties(count: number): FeedItem[] {
  const batch: FeedItem[] = [];

  for (let i = 0; i < count; i++) {
    const base = mockProperties[i % mockProperties.length];
    batch.push({
      type: 'property' as const,
      data: {
        ...base,
        id: `p-gen-${Date.now()}-${i}`,
        matchScore: Math.max(55, Math.min(99, base.matchScore + Math.floor(Math.random() * 20 - 10))),
        price: Math.round(base.price * (0.85 + Math.random() * 0.3)),
      },
    });

    // Mix in content every 2 properties
    if ((i + 1) % 2 === 0) {
      batch.push(nextContentItem());
    }
  }

  return batch;
}
