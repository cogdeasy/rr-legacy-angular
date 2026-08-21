import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';
import './Sidebar.scss';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

const navItems: NavItem[] = [
  { label: 'Fleet dashboard', icon: 'dashboard', route: '/dashboard' },
  { label: 'Engine explorer', icon: 'travel_explore', route: '/engine-explorer' },
  { label: 'Health trending', icon: 'show_chart', route: '/health-trending' },
  { label: 'Shop visit planner', icon: 'build_circle', route: '/shop-visit-planner' },
  { label: 'Work orders', icon: 'assignment', route: '/work-orders' },
  { label: 'Profile', icon: 'person_outline', route: '/profile' }
];

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  return (
    <nav className={`app-sidebar${isCollapsed ? ' collapsed' : ''}`}>
      {!isCollapsed ? <span className="micro-label section-label">Operations</span> : null}
      {navItems.map(item => (
        <NavLink
          key={item.route}
          to={item.route}
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          title={isCollapsed ? item.label : undefined}
        >
          <Icon name={item.icon} />
          {!isCollapsed ? <span className="nav-label">{item.label}</span> : null}
        </NavLink>
      ))}

      {!isCollapsed ? (
        <div className="sidebar-footer">
          <span className="micro-label">Data source</span>
          <p>EHM downlink, refreshed every 15 minutes.</p>
        </div>
      ) : null}
    </nav>
  );
}
