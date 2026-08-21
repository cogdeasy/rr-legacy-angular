import { User, UserPreferences } from '../models/user';
import { useStore } from '../lib/store';
import {
  currentUserStore,
  isAuthenticatedStore,
  login,
  logout,
  preferencesStore,
  updatePreferences,
  updateProfile
} from './authStore';

export interface AuthApi {
  currentUser: User | null;
  isAuthenticated: boolean;
  preferences: UserPreferences;
  login: () => Promise<User>;
  logout: () => void;
  updateProfile: (changes: Partial<User>) => Promise<User>;
  updatePreferences: (preferences: UserPreferences) => Promise<UserPreferences>;
}

/** Replaces `AuthService`; state lives in module stores so it is shared like a singleton. */
export function useAuth(): AuthApi {
  return {
    currentUser: useStore(currentUserStore),
    isAuthenticated: useStore(isAuthenticatedStore),
    preferences: useStore(preferencesStore),
    login,
    logout,
    updateProfile,
    updatePreferences
  };
}
