import { useEffect } from 'preact/hooks';
import { Route, useLocation } from 'wouter';
import { useAuth } from '../../context/AuthContext';

export function RequireAuth({ path, role, component: Component }) {
  return (
    <Route path={path}>
      {(params) => <Gate role={role} params={params} Component={Component} />}
    </Route>
  );
}

function Gate({ role, params, Component }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;
  if (role === 'admin' && !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <p className="text-display-lg text-fg mb-2">403</p>
          <p className="text-body text-fg-muted">You don't have access to this page.</p>
        </div>
      </div>
    );
  }
  return <Component {...params} />;
}
