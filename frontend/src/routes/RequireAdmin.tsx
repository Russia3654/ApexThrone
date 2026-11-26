import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RequireAdmin() {
  const { state } = useAuth();

  if (state.status === 'loading') {
    return (
      <p role="status" className="min-h-screen bg-bg p-6 text-ink-muted">
        Checking your session...
      </p>
    );
  }
  if (state.status === 'error') {
    return (
      <p role="alert" className="min-h-screen bg-bg p-6 text-crimson">
        The server could not be reached. Please reload.
      </p>
    );
  }
  if (state.status === 'anonymous') {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}
