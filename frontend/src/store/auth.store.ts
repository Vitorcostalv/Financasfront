import { create } from 'zustand';
import type { User } from '../types/dto';

const STORAGE_KEY = 'finance_auth';

const loadFromStorage = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { token: null, user: null };
  }
  try {
    const parsed = JSON.parse(raw);
    return { token: parsed?.token ?? null, user: parsed?.user ?? null };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { token: null, user: null };
  }
};

const initial = loadFromStorage();

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hydrateFromStorage: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: initial.token,
  user: initial.user,
  isAuthenticated: Boolean(initial.token),
  login: (token, user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },
  hydrateFromStorage: () => {
    const stored = loadFromStorage();
    if (stored.token) {
      set({ token: stored.token, user: stored.user, isAuthenticated: true });
    }
  },
}));
