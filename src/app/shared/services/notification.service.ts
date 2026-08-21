import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppNotification } from '../models/engine.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([
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

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.notifications$.pipe(
    map(notifications => notifications.filter(notification => !notification.read).length)
  );

  push(notification: Pick<AppNotification, 'title' | 'message' | 'category'>): void {
    const created: AppNotification = {
      id: `NTF-${100 + this.notificationsSubject.value.length}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    this.notificationsSubject.next([created, ...this.notificationsSubject.value]);
  }

  markAsRead(id: string): void {
    this.notificationsSubject.next(
      this.notificationsSubject.value.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }

  markAllAsRead(): void {
    this.notificationsSubject.next(
      this.notificationsSubject.value.map(notification => ({ ...notification, read: true }))
    );
  }
}
