import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Router } from '../app/router';
import { logout } from '../shared/auth/authStore';

describe('router guards and redirects', () => {
  beforeEach(() => {
    logout();
    localStorage.clear();
  });

  it('redirects an unauthenticated protected route to login', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Router />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it.each(['/', '/not-a-route'])(
    'redirects %s to the login route',
    async (path) => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <Router />
        </MemoryRouter>
      );

      expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    }
  );
});
