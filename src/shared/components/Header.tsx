import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { formatDate } from '../lib/date';
import { useNotifications } from '../notifications/notificationStore';
import { Icon } from './Icon';
import './Header.scss';

interface HeaderProps {
  onToggleSidebar: () => void;
}

type OpenMenu = 'notifications' | 'user' | null;

export function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const headerRight = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) {
      return;
    }
    const onDocumentClick = (event: MouseEvent) => {
      if (!headerRight.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', onDocumentClick);
    return () => document.removeEventListener('mousedown', onDocumentClick);
  }, [openMenu]);

  const initials = currentUser ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}` : '';

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="rr-icon-button" onClick={onToggleSidebar} aria-label="Toggle navigation">
          <Icon name="menu" />
        </button>
        <div className="brand">
          <span className="brand-mark">RR</span>
          <div className="brand-text">
            <span className="brand-title">Engine Operations Portal</span>
            <span className="brand-sub micro-label">Health &amp; MRO control</span>
          </div>
        </div>
      </div>

      <div className="header-right" ref={headerRight}>
        <div className="menu-anchor">
          <button
            className="rr-icon-button"
            aria-label="Notifications"
            onClick={() => setOpenMenu(openMenu === 'notifications' ? null : 'notifications')}
          >
            <Icon name="notifications_none" />
            {unreadCount > 0 ? <span className="rr-badge">{unreadCount}</span> : null}
          </button>

          {openMenu === 'notifications' ? (
            <div className="rr-menu notification-menu">
              <div className="notification-header">
                <span className="micro-label">Notifications</span>
                <button className="rr-button" onClick={markAllAsRead}>
                  Mark all read
                </button>
              </div>
              <hr className="rr-divider" />
              {notifications.map(notification => (
                <button
                  key={notification.id}
                  className={`rr-menu-item notification-item${notification.read ? '' : ' unread'}`}
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
          ) : null}
        </div>

        <div className="menu-anchor">
          <button
            className="rr-button user-button"
            onClick={() => setOpenMenu(openMenu === 'user' ? null : 'user')}
          >
            <span className="avatar">{initials}</span>
            {currentUser ? (
              <span className="user-meta">
                <span className="user-name">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className="user-role">{currentUser.role}</span>
              </span>
            ) : null}
            <Icon name="expand_more" />
          </button>

          {openMenu === 'user' ? (
            <div className="rr-menu">
              <Link className="rr-menu-item" to="/profile" onClick={() => setOpenMenu(null)}>
                <Icon name="person_outline" />
                <span>Profile</span>
              </Link>
              <button className="rr-menu-item" onClick={onLogout}>
                <Icon name="logout" />
                <span>Sign out</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
