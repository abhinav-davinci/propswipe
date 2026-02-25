import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { JourneyStage, PersonalityProfile, Achievement } from '../types/user';
import type { VisitStreak, ProfileStats } from '../types/gamification';

interface ProfileState {
  journeyStage: JourneyStage;
  personality: PersonalityProfile | null;
  visitStreak: VisitStreak;
  achievements: Achievement[];
  stats: ProfileStats;

  setJourneyStage: (stage: JourneyStage) => void;
  setPersonality: (profile: PersonalityProfile) => void;
  incrementSwipes: () => void;
  incrementSaved: () => void;
  incrementViewed: () => void;
  incrementInsightsRead: () => void;
  updateStreak: () => void;
  unlockAchievement: (id: string) => void;
}

const today = new Date().toISOString().split('T')[0];

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      journeyStage: 'explorer',
      personality: null,
      visitStreak: {
        currentStreak: 1,
        longestStreak: 1,
        lastVisitDate: today,
      },
      achievements: [],
      stats: {
        totalSwipes: 0,
        propertiesSaved: 0,
        propertiesViewed: 0,
        insightsRead: 0,
        daysActive: 1,
      },

      setJourneyStage: (stage) => set({ journeyStage: stage }),

      setPersonality: (profile) => set({ personality: profile }),

      incrementSwipes: () =>
        set((state) => ({
          stats: { ...state.stats, totalSwipes: state.stats.totalSwipes + 1 },
        })),

      incrementSaved: () =>
        set((state) => ({
          stats: { ...state.stats, propertiesSaved: state.stats.propertiesSaved + 1 },
        })),

      incrementViewed: () =>
        set((state) => ({
          stats: { ...state.stats, propertiesViewed: state.stats.propertiesViewed + 1 },
        })),

      incrementInsightsRead: () =>
        set((state) => ({
          stats: { ...state.stats, insightsRead: state.stats.insightsRead + 1 },
        })),

      updateStreak: () => {
        const { visitStreak } = get();
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (visitStreak.lastVisitDate === todayStr) return;

        const newStreak =
          visitStreak.lastVisitDate === yesterday
            ? visitStreak.currentStreak + 1
            : 1;

        set({
          visitStreak: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, visitStreak.longestStreak),
            lastVisitDate: todayStr,
          },
        });
      },

      unlockAchievement: (id) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id ? { ...a, unlockedAt: new Date().toISOString(), progress: 100 } : a
          ),
        })),
    }),
    {
      name: 'propswipe-profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
