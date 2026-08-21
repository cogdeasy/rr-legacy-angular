import { act } from '@testing-library/react';
import {
  currentUserStore,
  isAuthenticatedStore,
  login,
  logout
} from '../shared/auth/authStore';

describe('auth store', () => {
  beforeEach(() => {
    logout();
    localStorage.clear();
  });

  afterEach(() => {
    logout();
    vi.useRealTimers();
  });

  it('logs in after the mocked delay and persists the session key', async () => {
    vi.useFakeTimers();

    let promise: ReturnType<typeof login>;
    await act(async () => {
      promise = login('ignored@example.com', 'ignored');
      await vi.advanceTimersByTimeAsync(1200);
    });

    const user = await promise!;
    expect(user.email).toBe('alice.whitmore@rolls-royce.com');
    expect(currentUserStore.get()).toEqual(user);
    expect(isAuthenticatedStore.get()).toBe(true);
    expect(localStorage.getItem('rr_portal_auth')).toBe('true');
  });

  it('logs out and clears the persisted session', async () => {
    vi.useFakeTimers();

    await act(async () => {
      const promise = login('ignored@example.com', 'ignored');
      await vi.advanceTimersByTimeAsync(1200);
      await promise;
    });

    logout();

    expect(currentUserStore.get()).toBeNull();
    expect(isAuthenticatedStore.get()).toBe(false);
    expect(localStorage.getItem('rr_portal_auth')).toBeNull();
  });
});
