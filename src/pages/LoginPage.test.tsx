import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import LoginPage from './LoginPage';
import { logout } from '../shared/auth/authStore';

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<h1>Fleet dashboard</h1>} />
      </Routes>
    </MemoryRouter>
  );

describe('LoginPage', () => {
  afterEach(() => act(() => logout()));

  it('rejects an empty form with the validation message', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Enter your Rolls-Royce email and password')).toBeInTheDocument();
  });

  it('signs in and lands on the dashboard', async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText('Email address'), 'alice.whitmore@rolls-royce.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByRole('heading', { name: 'Fleet dashboard' }, { timeout: 4000 })
    ).toBeInTheDocument();
  });
});
