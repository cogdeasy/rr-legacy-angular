import { ComponentType, Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { RequireAuth } from '../shared/components/RequireAuth';
import { AppShell } from './AppShell';
import { LegacyAngularRoute } from './LegacyAngularRoute';

const lazyPage = (load: () => Promise<{ default: ComponentType }>) => {
  const Page = lazy(load);
  return (
    <Suspense fallback={<LoadingSpinner isLoading message="Loading page…" />}>
      <Page />
    </Suspense>
  );
};

/**
 * Route map mirroring `app-routing.module.ts`. Pages already migrated render React;
 * the rest still render the Angular route through the strangler-fig bridge.
 */
export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/login', element: lazyPage(() => import('../pages/LoginPage')) },
      {
        path: '/dashboard',
        element: <RequireAuth>{<LegacyAngularRoute />}</RequireAuth>
      },
      {
        path: '/engine-explorer',
        element: <RequireAuth>{<LegacyAngularRoute />}</RequireAuth>
      },
      {
        path: '/health-trending',
        element: <RequireAuth>{<LegacyAngularRoute />}</RequireAuth>
      },
      {
        path: '/shop-visit-planner',
        element: <RequireAuth>{<LegacyAngularRoute />}</RequireAuth>
      },
      {
        path: '/work-orders',
        element: <RequireAuth>{<LegacyAngularRoute />}</RequireAuth>
      },
      {
        path: '/profile',
        element: <RequireAuth>{lazyPage(() => import('../pages/ProfilePage'))}</RequireAuth>
      },
      { path: '/', element: <Navigate to="/login" replace /> },
      { path: '*', element: <Navigate to="/login" replace /> }
    ]
  }
]);
