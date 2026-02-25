export interface Insight {
  id: string;
  title: string;
  summary: string;
  category: 'tip' | 'trend' | 'alert' | 'guide';
  icon: string;
  readTimeMinutes: number;
  publishedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  imageUrl: string;
  publishedAt: string;
  url: string;
  category: 'market' | 'policy' | 'infrastructure' | 'general';
}

export interface MarketPulse {
  id: string;
  area: string;
  avgPrice: number;
  priceChange: number; // percentage
  demandLevel: 'low' | 'medium' | 'high' | 'very_high';
  newListings: number;
  period: string;
}

export interface NeighbourhoodScore {
  category: string;
  score: number; // 0-10
  icon: string;
}

export interface NeighbourhoodChapter {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  heroImage: string;
  scores: NeighbourhoodScore[];
  avgPrice: number;
  priceChange: number;
  highlights: string[];
}
