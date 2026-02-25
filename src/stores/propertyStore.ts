import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Property } from '../types/property';

interface PropertyState {
  savedProperties: Property[];
  superLiked: Property[];
  passedIds: string[];
  compareList: Property[];

  saveProperty: (property: Property) => void;
  unsaveProperty: (id: string) => void;
  superLikeProperty: (property: Property) => void;
  passProperty: (id: string) => void;
  addToCompare: (property: Property) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isPropertySaved: (id: string) => boolean;
  isSuperLiked: (id: string) => boolean;
}

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      savedProperties: [],
      superLiked: [],
      passedIds: [],
      compareList: [],

      saveProperty: (property) =>
        set((state) => {
          if (state.savedProperties.find((p) => p.id === property.id)) return state;
          return { savedProperties: [...state.savedProperties, property] };
        }),

      unsaveProperty: (id) =>
        set((state) => ({
          savedProperties: state.savedProperties.filter((p) => p.id !== id),
        })),

      superLikeProperty: (property) =>
        set((state) => {
          if (state.superLiked.find((p) => p.id === property.id)) return state;
          return {
            superLiked: [...state.superLiked, property],
            savedProperties: state.savedProperties.find((p) => p.id === property.id)
              ? state.savedProperties
              : [...state.savedProperties, property],
          };
        }),

      passProperty: (id) =>
        set((state) => ({
          passedIds: [...state.passedIds, id],
        })),

      addToCompare: (property) =>
        set((state) => {
          if (state.compareList.length >= 3) return state;
          if (state.compareList.find((p) => p.id === property.id)) return state;
          return { compareList: [...state.compareList, property] };
        }),

      removeFromCompare: (id) =>
        set((state) => ({
          compareList: state.compareList.filter((p) => p.id !== id),
        })),

      clearCompare: () => set({ compareList: [] }),

      isPropertySaved: (id) => get().savedProperties.some((p) => p.id === id),

      isSuperLiked: (id) => get().superLiked.some((p) => p.id === id),
    }),
    {
      name: 'propswipe-properties',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
