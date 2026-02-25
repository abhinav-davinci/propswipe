import { create } from 'zustand';
import type { FeedItem } from '../types/feed';
import type { SwipeAction } from '../types/property';

interface FeedState {
  cards: FeedItem[];
  currentIndex: number;
  swipeHistory: SwipeAction[];
  isLoading: boolean;

  setCards: (cards: FeedItem[]) => void;
  addCards: (cards: FeedItem[]) => void;
  advanceCard: () => void;
  addSwipeAction: (action: SwipeAction) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useFeedStore = create<FeedState>()((set, get) => ({
  cards: [],
  currentIndex: 0,
  swipeHistory: [],
  isLoading: false,

  setCards: (cards) => set({ cards, currentIndex: 0 }),

  addCards: (cards) =>
    set((state) => ({ cards: [...state.cards, ...cards] })),

  advanceCard: () =>
    set((state) => ({ currentIndex: state.currentIndex + 1 })),

  addSwipeAction: (action) =>
    set((state) => ({
      swipeHistory: [...state.swipeHistory, action],
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  reset: () =>
    set({ cards: [], currentIndex: 0, swipeHistory: [], isLoading: false }),
}));
