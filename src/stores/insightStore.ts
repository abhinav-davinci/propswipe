import { create } from 'zustand';
import type { Insight, NewsItem, MarketPulse, NeighbourhoodChapter } from '../types/insight';

interface InsightState {
  insights: Insight[];
  news: NewsItem[];
  marketPulse: MarketPulse[];
  neighbourhoodChapters: NeighbourhoodChapter[];
  isLoading: boolean;

  setInsights: (insights: Insight[]) => void;
  setNews: (news: NewsItem[]) => void;
  setMarketPulse: (data: MarketPulse[]) => void;
  setNeighbourhoodChapters: (chapters: NeighbourhoodChapter[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useInsightStore = create<InsightState>()((set) => ({
  insights: [],
  news: [],
  marketPulse: [],
  neighbourhoodChapters: [],
  isLoading: false,

  setInsights: (insights) => set({ insights }),
  setNews: (news) => set({ news }),
  setMarketPulse: (data) => set({ marketPulse: data }),
  setNeighbourhoodChapters: (chapters) => set({ neighbourhoodChapters: chapters }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
