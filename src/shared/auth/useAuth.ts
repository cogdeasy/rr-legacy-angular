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

export function useAuth() {
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
