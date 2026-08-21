import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '../shared/components/RequireAuth';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const EngineExplorerPage = lazy(() => import('../pages/EngineExplorerPage'));
const HealthTrendingPage = lazy(() => import('../pages/HealthTrendingPage'));
const ShopVisitPlannerPage = lazy(() => import('../pages/ShopVisitPlannerPage'));
const WorkOrdersPage = lazy(() => import('../pages/WorkOrdersPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export function Router() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LazyPage>
            <LoginPage />
          </LazyPage>
        }
      />
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<LazyPage><DashboardPage /></LazyPage>} />
        <Route path="/engine-explorer" element={<LazyPage><EngineExplorerPage /></LazyPage>} />
        <Route path="/health-trending" element={<LazyPage><HealthTrendingPage /></LazyPage>} />
        <Route path="/shop-visit-planner" element={<LazyPage><ShopVisitPlannerPage /></LazyPage>} />
        <Route path="/work-orders" element={<LazyPage><WorkOrdersPage /></LazyPage>} />
        <Route path="/profile" element={<LazyPage><ProfilePage /></LazyPage>} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
