import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from '../shared/components/Footer';
import { Header } from '../shared/components/Header';
import { Sidebar } from '../shared/components/Sidebar';
import { useAuth } from '../shared/auth/useAuth';
import './AppShell.scss';

/** React equivalent of `AppComponent`: portal chrome around the routed page. */
export function AppShell() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isLoginPage = pathname === '/login';

  if (isLoginPage || !isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="app-layout">
      <Header onToggleSidebar={() => setSidebarCollapsed(collapsed => !collapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} />
      <main className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <div className="page-wrapper">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}
