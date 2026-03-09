export interface ChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface ChartData {
  type: 'bar' | 'trend';
  items: ChartItem[];
  unit?: string;
}

export interface Insight {
  id: string;
  title: string;
  summary: string;
  keyTakeaway: string;
  category: 'tip' | 'trend' | 'alert' | 'guide';
  icon: string;
  readTimeMinutes: number;
  publishedAt: string;
  chartData?: ChartData;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  body: string;
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
  priceChange: number;
  demandLevel: 'low' | 'medium' | 'high' | 'very_high';
  newListings: number;
  period: string;
}

export interface NeighbourhoodScore {
  category: string;
  score: number;
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

export interface VideoReel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  source: string;
  category: 'explainer' | 'market_update' | 'property_tour' | 'tips';
}
