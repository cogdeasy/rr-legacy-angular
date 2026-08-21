import { beforeEach, describe, expect, it } from 'vitest';
import {
  AUTH_STORAGE_KEY,
  currentUserStore,
  isAuthenticatedStore,
  login,
  logout,
  updatePreferences,
  updateProfile
} from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    logout();
  });

  it('persists the mocked session under rr_portal_auth', async () => {
    await login();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe('true');
    expect(isAuthenticatedStore.get()).toBe(true);
    expect(currentUserStore.get()?.email).toContain('@rolls-royce.com');
  });

  it('clears the session on logout', async () => {
    await login();
    logout();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(isAuthenticatedStore.get()).toBe(false);
    expect(currentUserStore.get()).toBeNull();
  });

  it('applies profile changes to the current user', async () => {
    await login();
    const updated = await updateProfile({ phone: '+44 7700 900999' });
    expect(updated.phone).toBe('+44 7700 900999');
    expect(currentUserStore.get()?.phone).toBe('+44 7700 900999');
  });

  it('saves alerting preferences', async () => {
    const saved = await updatePreferences({
      alertEmails: false,
      dailyFleetDigest: false,
      aogPager: true,
      egtMarginThreshold: 15,
      defaultFleet: 'Trent 7000'
    });
    expect(saved.egtMarginThreshold).toBe(15);
    expect(saved.defaultFleet).toBe('Trent 7000');
  });
});
