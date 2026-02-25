import type { PropertyType, TransactionType } from './property';

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  createdAt: string;
}

export interface OnboardingPreferences {
  name: string;
  propertyType: PropertyType | null;
  transactionType: TransactionType | null;
  selectedAreas: string[];
  budgetMin: number;
  budgetMax: number;
  isComplete: boolean;
}

export type JourneyStage =
  | 'explorer'     // Just browsing
  | 'hunter'       // Actively searching
  | 'shortlister'  // Narrowing down
  | 'negotiator'   // Ready to deal
  | 'nester';      // Found it!

export type PersonalityType =
  | 'The Minimalist'
  | 'The Maximizer'
  | 'The Location Purist'
  | 'The Value Seeker'
  | 'The Amenity Buff'
  | 'The Quick Decider';

export interface PersonalityProfile {
  type: PersonalityType;
  traits: {
    label: string;
    score: number; // 0-100
  }[];
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number; // 0-100
}
