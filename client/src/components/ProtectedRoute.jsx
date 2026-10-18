import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Spinner from './ui/Spinner';

// Private pages: wait for the "who am I?" check, then allow or redirect to /login.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner label="Checking your session…" className="min-h-screen" />;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

// Login/Signup: signed-in users go straight to the dashboard.
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Loading…" className="min-h-[50vh]" />;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
