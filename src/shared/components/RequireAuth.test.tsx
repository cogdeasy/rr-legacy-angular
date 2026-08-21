import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { RequireAuth } from './RequireAuth';
import { login, logout } from '../auth/authStore';

const renderGuarded = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <h1>Fleet dashboard</h1>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<h1>Sign in</h1>} />
      </Routes>
    </MemoryRouter>
  );

describe('RequireAuth', () => {
  afterEach(() => act(() => logout()));

  it('redirects an unauthenticated visitor to the sign-in route', () => {
    renderGuarded();
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders the guarded route once a session exists', async () => {
    await act(() => login());
    renderGuarded();
    expect(screen.getByRole('heading', { name: 'Fleet dashboard' })).toBeInTheDocument();
  });
});
