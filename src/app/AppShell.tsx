import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../shared/auth/useAuth';
import { Footer } from '../shared/components/Footer';
import { Header } from '../shared/components/Header';
import { Sidebar } from '../shared/components/Sidebar';
import { Router } from './router';
import './AppShell.scss';

export function AppShell() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <Router />;
  }

  if (isAuthenticated) {
    return (
      <div className="app-layout">
        <Header onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)} />
        <Sidebar isCollapsed={sidebarCollapsed} />
        <main className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
          <div className="page-wrapper">
            <Router />
          </div>
          <Footer />
        </main>
      </div>
    );
  }

  return <Router />;
}
