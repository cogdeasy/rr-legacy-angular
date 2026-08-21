import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import EngineExplorerPage from '../pages/EngineExplorerPage';
import HealthTrendingPage from '../pages/HealthTrendingPage';
import ShopVisitPlannerPage from '../pages/ShopVisitPlannerPage';
import WorkOrdersPage from '../pages/WorkOrdersPage';
import ProfilePage from '../pages/ProfilePage';
import { currentUserStore, isAuthenticatedStore, logout } from '../shared/auth/authStore';
import { notificationsStore } from '../shared/notifications/notificationStore';
import { User } from '../shared/models/user';

const testUser: User = {
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

async function advanceTimers(milliseconds: number): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
    for (let tick = 0; tick < 5; tick += 1) {
      await Promise.resolve();
    }
  });
}

function getWorkOrderForm(): HTMLFormElement {
  const form = screen.getByText('New work order').closest('form');
  if (!(form instanceof HTMLFormElement)) {
    throw new Error('Work-order form is not rendered');
  }
  return form;
}

describe('page smoke renders', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    logout();
    vi.useRealTimers();
  });

  it.each([
    [LoginPage, 'Engine Operations Portal'],
    [DashboardPage, 'Good morning, Alice'],
    [EngineExplorerPage, 'Managed engine register'],
    [HealthTrendingPage, 'Twelve month signal history'],
    [ShopVisitPlannerPage, 'Workscope and turnaround estimate'],
    [WorkOrdersPage, 'Maintenance execution'],
    [ProfilePage, 'Your operations account']
  ])('renders %s', async (Page, heading) => {
    currentUserStore.set(testUser);
    isAuthenticatedStore.set(true);
    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    );
    await advanceTimers(1200);

    expect(screen.getByText(heading)).toBeInTheDocument();
  });
});

describe('work-order form', () => {
  beforeEach(() => {
    currentUserStore.set(testUser);
    isAuthenticatedStore.set(true);
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    logout();
    vi.useRealTimers();
  });

  it('shows required and length/email validation messages', async () => {
    render(<WorkOrdersPage />);
    await advanceTimers(600);
    fireEvent.click(screen.getByRole('button', { name: /Raise work order/ }));

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Short' } });
    fireEvent.change(screen.getByLabelText('Contact email'), {
      target: { value: 'invalid-email' }
    });
    fireEvent.change(screen.getByLabelText('Findings'), {
      target: { value: 'Too short' }
    });
    fireEvent.change(screen.getByLabelText('Requested tasks (one per line)'), {
      target: { value: '' }
    });
    fireEvent.submit(getWorkOrderForm());

    expect(
      screen.getByText('Select the engine this work applies to.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Give the work order a descriptive title.')
    ).toBeInTheDocument();
    expect(screen.getByText('A due date is required.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid contact email.')).toBeInTheDocument();
    expect(screen.getByText('Record the supporting findings.')).toBeInTheDocument();
    expect(screen.getByText('List at least one task.')).toBeInTheDocument();
  });

  it('prepends a successful order and pushes a notification', async () => {
    const notificationsBefore = notificationsStore.get();
    render(<WorkOrdersPage />);
    await advanceTimers(600);
    fireEvent.click(screen.getByRole('button', { name: /Raise work order/ }));

    fireEvent.change(screen.getByLabelText('Engine serial number'), {
      target: { value: 'ESN-10241' }
    });
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'HP turbine borescope rectification' }
    });
    fireEvent.change(screen.getByLabelText('Due date'), {
      target: { value: '2026-04-12' }
    });
    fireEvent.change(screen.getByLabelText('Findings'), {
      target: { value: 'Stage 1 NGV distress observed at borescope.' }
    });
    fireEvent.change(screen.getByLabelText('Requested tasks (one per line)'), {
      target: { value: 'Replace stage 1 NGV set' }
    });
    fireEvent.submit(getWorkOrderForm());
    await advanceTimers(900);

    expect(
      screen.getByText(/raised and routed to the facility planning queue/)
    ).toBeInTheDocument();
    expect(screen.getByText('HP turbine borescope rectification')).toBeInTheDocument();
    expect(notificationsStore.get()[0].title).toMatch(/raised$/);
    expect(notificationsStore.get()[0].message).toContain('ESN-10241');

    notificationsStore.set(notificationsBefore);
  });
});
