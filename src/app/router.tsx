import { ComponentType, Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { RequireAuth } from '../shared/components/RequireAuth';
import { AppShell } from './AppShell';

const lazyPage = (load: () => Promise<{ default: ComponentType }>) => {
  const Page = lazy(load);
  return (
    <Suspense fallback={<LoadingSpinner isLoading message="Loading page…" />}>
      <Page />
    </Suspense>
  );
};

const protectedPage = (load: () => Promise<{ default: ComponentType }>) => (
  <RequireAuth>{lazyPage(load)}</RequireAuth>
);

/** Route map mirroring `app-routing.module.ts`; every route but /login is guarded. */
export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/login', element: lazyPage(() => import('../pages/LoginPage')) },
      {
        path: '/dashboard',
        element: protectedPage(() => import('../pages/DashboardPage'))
      },
      {
        path: '/engine-explorer',
        element: protectedPage(() => import('../pages/EngineExplorerPage'))
      },
      {
        path: '/health-trending',
        element: protectedPage(() => import('../pages/HealthTrendingPage'))
      },
      {
        path: '/shop-visit-planner',
        element: protectedPage(() => import('../pages/ShopVisitPlannerPage'))
      },
      {
        path: '/work-orders',
        element: protectedPage(() => import('../pages/WorkOrdersPage'))
      },
      {
        path: '/profile',
        element: protectedPage(() => import('../pages/ProfilePage'))
      },
      { path: '/', element: <Navigate to="/login" replace /> },
      { path: '*', element: <Navigate to="/login" replace /> }
    ]
  }
]);
