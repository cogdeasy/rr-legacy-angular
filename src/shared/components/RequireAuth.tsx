import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

/** Replaces `AuthGuard`: unauthenticated visitors are sent to the sign-in route. */
export function RequireAuth({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
