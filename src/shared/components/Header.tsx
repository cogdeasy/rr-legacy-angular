import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../lib/date';
import { useAuth } from '../auth/useAuth';
import { useNotifications } from '../notifications/notificationStore';
import { Icon } from './Icon';
import './Header.scss';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<'notifications' | 'user' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const initials = currentUser
    ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`
    : '';

  const onLogout = () => {
    setOpenMenu(null);
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="rr-icon-button" onClick={onToggleSidebar} aria-label="Toggle navigation">
          <Icon>menu</Icon>
        </button>
        <div className="brand">
          <span className="brand-mark">RR</span>
          <div className="brand-text">
            <span className="brand-title">Engine Operations Portal</span>
            <span className="brand-sub micro-label">Health &amp; MRO control</span>
          </div>
        </div>
      </div>

      <div className="header-right" ref={menuRef}>
        <div className="rr-menu-anchor">
          <button
            className="rr-icon-button notification-button"
            onClick={() => setOpenMenu(openMenu === 'notifications' ? null : 'notifications')}
            aria-label="Notifications"
            aria-expanded={openMenu === 'notifications'}
          >
            <Icon>notifications_none</Icon>
            {unreadCount > 0 && <span className="rr-badge">{unreadCount}</span>}
          </button>
          {openMenu === 'notifications' && (
            <div className="rr-menu notification-menu">
              <div className="notification-header">
                <span className="micro-label">Notifications</span>
                <button className="rr-menu-action" onClick={markAllAsRead}>Mark all read</button>
              </div>
              <div className="rr-divider" />
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`notification-item${notification.read ? '' : ' unread'}`}
                  onClick={() => {
                    markAsRead(notification.id);
                    setOpenMenu(null);
                  }}
                >
                  <span className="notification-body">
                    <span className="notification-title">{notification.title}</span>
                    <span className="notification-message">{notification.message}</span>
                    <span className="notification-time">
                      {formatDate(notification.timestamp, 'dd MMM, HH:mm')}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rr-menu-anchor">
          <button
            className="user-button"
            onClick={() => setOpenMenu(openMenu === 'user' ? null : 'user')}
            aria-expanded={openMenu === 'user'}
          >
            <span className="avatar">{initials}</span>
            {currentUser && (
              <span className="user-meta">
                <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
                <span className="user-role">{currentUser.role}</span>
              </span>
            )}
            <Icon>expand_more</Icon>
          </button>
          {openMenu === 'user' && (
            <div className="rr-menu user-menu">
              <button
                className="rr-menu-item"
                onClick={() => {
                  setOpenMenu(null);
                  navigate('/profile');
                }}
              >
                <Icon>person_outline</Icon>
                <span>Profile</span>
              </button>
              <button className="rr-menu-item" onClick={onLogout}>
                <Icon>logout</Icon>
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
