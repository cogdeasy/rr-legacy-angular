import { describe, expect, it } from 'vitest';
import { markAllAsRead, markAsRead, notificationsStore, pushNotification } from './notificationStore';

const unreadCount = () => notificationsStore.get().filter(item => !item.read).length;

describe('notificationStore', () => {
  it('prepends a pushed notification as unread', () => {
    const before = notificationsStore.get().length;
    pushNotification({
      title: 'WO-30440 raised',
      message: 'Routed to Derby for ESN-10241.',
      category: 'shop-visit'
    });
    const notifications = notificationsStore.get();
    expect(notifications.length).toBe(before + 1);
    expect(notifications[0].read).toBe(false);
    expect(notifications[0].title).toBe('WO-30440 raised');
  });

  it('marks a single notification as read', () => {
    const target = notificationsStore.get().find(item => !item.read);
    expect(target).toBeDefined();
    markAsRead(target!.id);
    expect(notificationsStore.get().find(item => item.id === target!.id)?.read).toBe(true);
  });

  it('marks every notification as read', () => {
    markAllAsRead();
    expect(unreadCount()).toBe(0);
  });
});
