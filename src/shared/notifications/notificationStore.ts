import { AppNotification } from '../models/engine';
import { createStore, useStore } from '../lib/store';

export const notificationsStore = createStore<AppNotification[]>([
  {
    id: 'NTF-001',
    title: 'EGT margin below threshold',
    message: 'ESN-10241 (British Airways) dropped to 8 degC margin overnight.',
    timestamp: '2026-03-25T22:12:00Z',
    read: false,
    category: 'alert'
  },
  {
    id: 'NTF-002',
    title: 'Shop visit slot confirmed',
    message: 'Dahlewitz bay 4 confirmed for ESN-10457 from 6 April.',
    timestamp: '2026-03-24T14:40:00Z',
    read: false,
    category: 'shop-visit'
  },
  {
    id: 'NTF-003',
    title: 'Fan blade set on backorder',
    message: 'Part 72-K4471 for WO-30428 now quoted at 9 days.',
    timestamp: '2026-03-23T08:05:00Z',
    read: false,
    category: 'supply'
  },
  {
    id: 'NTF-004',
    title: 'Service bulletin issued',
    message: 'SB-72-K118 applies to 14 engines in the Trent 1000 fleet.',
    timestamp: '2026-03-20T16:25:00Z',
    read: true,
    category: 'compliance'
  }
]);

export function pushNotification(notification: Pick<AppNotification, 'title' | 'message' | 'category'>): void {
  const created: AppNotification = {
    id: `NTF-${100 + notificationsStore.get().length}`,
    timestamp: new Date().toISOString(),
    read: false,
    ...notification
  };
  notificationsStore.set([created, ...notificationsStore.get()]);
}

export function markAsRead(id: string): void {
  notificationsStore.set(
    notificationsStore.get().map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    )
  );
}

export function markAllAsRead(): void {
  notificationsStore.set(notificationsStore.get().map(notification => ({ ...notification, read: true })));
}

export interface NotificationsApi {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

/** Replaces `NotificationService`. */
export function useNotifications(): NotificationsApi {
  const notifications = useStore(notificationsStore);
  return {
    notifications,
    unreadCount: notifications.filter(notification => !notification.read).length,
    markAsRead,
    markAllAsRead
  };
}
