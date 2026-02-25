import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PropertyType, TransactionType } from '../types/property';

interface OnboardingState {
  name: string;
  propertyType: PropertyType | null;
  transactionType: TransactionType | null;
  selectedAreas: string[];
  budgetMin: number;
  budgetMax: number;
  isComplete: boolean;
  currentStep: number;

  setName: (name: string) => void;
  setPropertyType: (type: PropertyType) => void;
  setTransactionType: (type: TransactionType) => void;
  setSelectedAreas: (areas: string[]) => void;
  toggleArea: (area: string) => void;
  setBudget: (min: number, max: number) => void;
  completeOnboarding: () => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  name: '',
  propertyType: null as PropertyType | null,
  transactionType: null as TransactionType | null,
  selectedAreas: [] as string[],
  budgetMin: 2000000,
  budgetMax: 10000000,
  isComplete: false,
  currentStep: 0,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setName: (name) => set({ name }),

      setPropertyType: (type) => set({ propertyType: type }),

      setTransactionType: (type) => set({ transactionType: type }),

      setSelectedAreas: (areas) => set({ selectedAreas: areas }),

      toggleArea: (area) => {
        const current = get().selectedAreas;
        if (current.includes(area)) {
          set({ selectedAreas: current.filter((a) => a !== area) });
        } else {
          set({ selectedAreas: [...current, area] });
        }
      },

      setBudget: (min, max) => set({ budgetMin: min, budgetMax: max }),

      completeOnboarding: () => set({ isComplete: true }),

      setCurrentStep: (step) => set({ currentStep: step }),

      reset: () => set(initialState),
    }),
    {
      name: 'propswipe-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
