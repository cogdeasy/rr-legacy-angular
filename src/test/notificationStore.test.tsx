import { act, cleanup, render, screen } from '@testing-library/react';
import {
  notificationsStore,
  useNotifications
} from '../shared/notifications/notificationStore';

function NotificationCountProbe() {
  const { unreadCount } = useNotifications();
  return <span>{unreadCount}</span>;
}

describe('notification store', () => {
  afterEach(() => {
    cleanup();
  });

  it('derives unread count from direct notification store updates', () => {
    const initialNotifications = notificationsStore.get();
    render(<NotificationCountProbe />);

    act(() => {
      notificationsStore.set([
        ...initialNotifications,
        {
          id: 'NTF-TEST',
          title: 'Test notification',
          message: 'Test message',
          timestamp: '2026-03-26T08:00:00Z',
          read: false,
          category: 'alert'
        }
      ]);
    });

    expect(screen.getByText('4')).toBeInTheDocument();

    act(() => {
      notificationsStore.set(initialNotifications);
    });
  });
});
