import { User, UserPreferences } from '../models/user';
import { createStore, delay } from '../lib/store';

export const AUTH_STORAGE_KEY = 'rr_portal_auth';

const defaultPreferences: UserPreferences = {
  alertEmails: true,
  dailyFleetDigest: true,
  aogPager: true,
  egtMarginThreshold: 20,
  defaultFleet: 'Trent 1000'
};

let mockUser: User = {
  id: 'RR-4471',
  firstName: 'Alice',
  lastName: 'Whitmore',
  email: 'alice.whitmore@rolls-royce.com',
  phone: '+44 7700 900412',
  role: 'Fleet Health Controller',
  baseLocation: 'Derby, Sinfin — Operations Centre',
  authorityLevel: 'Level 3 — workscope release',
  lastLogin: '2026-03-26T06:15:00Z',
  employeeSince: '2016-09-05',
  fleetsCovered: ['Trent 1000', 'Trent XWB-84', 'Trent 7000']
};

const hasStoredSession = (): boolean => localStorage.getItem(AUTH_STORAGE_KEY) !== null;

export const currentUserStore = createStore<User | null>(hasStoredSession() ? mockUser : null);
export const isAuthenticatedStore = createStore<boolean>(hasStoredSession());
export const preferencesStore = createStore<UserPreferences>(defaultPreferences);

export async function login(): Promise<User> {
  const user = await delay(mockUser, 1200);
  localStorage.setItem(AUTH_STORAGE_KEY, 'true');
  currentUserStore.set(user);
  isAuthenticatedStore.set(true);
  return user;
}

export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  currentUserStore.set(null);
  isAuthenticatedStore.set(false);
}

export async function updateProfile(changes: Partial<User>): Promise<User> {
  mockUser = { ...mockUser, ...changes };
  const user = await delay(mockUser, 600);
  currentUserStore.set(user);
  return user;
}

export async function updatePreferences(preferences: UserPreferences): Promise<UserPreferences> {
  const saved = await delay(preferences, 400);
  preferencesStore.set(saved);
  return saved;
}

export const isLoggedIn = (): boolean => isAuthenticatedStore.get();
