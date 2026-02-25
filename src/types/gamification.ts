import type { JourneyStage, PersonalityProfile, Achievement } from './user';

export interface VisitStreak {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string;
}

export interface ProfileStats {
  totalSwipes: number;
  propertiesSaved: number;
  propertiesViewed: number;
  insightsRead: number;
  daysActive: number;
}

export interface GamificationState {
  journeyStage: JourneyStage;
  personality: PersonalityProfile | null;
  visitStreak: VisitStreak;
  achievements: Achievement[];
  stats: ProfileStats;
}
