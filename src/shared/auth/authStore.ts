import { delay } from '../lib/async';
import { createStore } from '../lib/store';
import { User, UserPreferences } from '../models/user';

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

export const currentUserStore = createStore<User | null>(
  localStorage.getItem('rr_portal_auth') ? mockUser : null
);
export const isAuthenticatedStore = createStore(Boolean(currentUserStore.get()));
export const preferencesStore = createStore(defaultPreferences);

export function login(_email: string, _password: string): Promise<User> {
  return delay(mockUser, 1200).then((user) => {
    localStorage.setItem('rr_portal_auth', 'true');
    currentUserStore.set(user);
    isAuthenticatedStore.set(true);
    return user;
  });
}

export function logout(): void {
  localStorage.removeItem('rr_portal_auth');
  currentUserStore.set(null);
  isAuthenticatedStore.set(false);
}

export function updateProfile(changes: Partial<User>): Promise<User> {
  const updated = { ...mockUser, ...changes };
  mockUser = updated;
  return delay(updated, 600).then((user) => {
    currentUserStore.set(user);
    return user;
  });
}

export function updatePreferences(preferences: UserPreferences): Promise<UserPreferences> {
  return delay(preferences, 400).then((nextPreferences) => {
    preferencesStore.set(nextPreferences);
    return nextPreferences;
  });
}
