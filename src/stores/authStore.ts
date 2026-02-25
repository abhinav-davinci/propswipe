import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;

  signIn: (user: User, token: string) => void;
  signOut: () => void;
  enterGuestMode: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: true,

      signIn: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
        }),

      signOut: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isGuest: false,
          isLoading: false,
        }),

      enterGuestMode: () =>
        set({
          isGuest: true,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'propswipe-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
      }),
    }
  )
);
