import { create } from 'zustand';
import type { User } from '../types/dto';

export const TOKEN_KEY = 'finance_token';
const USER_KEY = 'finance.user';
const LEGACY_AUTH_KEY = 'finance_auth';
const LEGACY_TOKEN_KEY = 'finance.token';

const safeParse = (raw: string) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const migrateLegacy = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  let token: string | null = null;
  let user: User | null = null;

  const legacyAuthRaw = localStorage.getItem(LEGACY_AUTH_KEY);
  if (legacyAuthRaw) {
    const parsed = safeParse(legacyAuthRaw);
    token = parsed?.token ?? token;
    user = parsed?.user ?? user;
    localStorage.removeItem(LEGACY_AUTH_KEY);
  }

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacyToken && !token) {
    token = legacyToken;
  }
  localStorage.removeItem(LEGACY_TOKEN_KEY);

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  return { token, user };
};

const loadFromStorage = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  const user = userRaw ? safeParse(userRaw) : null;
  if (token) {
    return { token, user };
  }
  return migrateLegacy();
};

const initial = loadFromStorage();

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setSession: (token: string, user?: User | null) => void;
  login: (token: string, user?: User | null) => void;
  logout: () => void;
  hydrate: () => void;
  hydrateFromStorage: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initial.token,
  user: initial.user,
  isAuthenticated: Boolean(initial.token),
  setSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    set({ token, user: user ?? null, isAuthenticated: true });
  },
  login: (token, user) => {
    get().setSession(token, user);
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_AUTH_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },
  hydrate: () => {
    const stored = loadFromStorage();
    if (stored.token) {
      set({ token: stored.token, user: stored.user, isAuthenticated: true });
    } else {
      set({ token: null, user: null, isAuthenticated: false });
    }
  },
  hydrateFromStorage: () => {
    get().hydrate();
  },
}));
