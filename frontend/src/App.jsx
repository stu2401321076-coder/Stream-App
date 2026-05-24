import { Suspense, lazy } from 'preact/compat';
import { Route, Router, Switch, useLocation, Redirect } from 'wouter';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { RequireAuth } from './components/layout/RequireAuth';
import { NotFound } from './components/layout/NotFound';
import { PageSkeleton } from './components/layout/PageSkeleton';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Movies = lazy(() => import('./pages/Movies'));
const MovieForm = lazy(() => import('./pages/MovieForm'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const WatchMovie = lazy(() => import('./pages/WatchMovie'));
const Reviews = lazy(() => import('./pages/Reviews'));
const ReviewForm = lazy(() => import('./pages/ReviewForm'));

export function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

function Shell() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const isWatchRoute = /^\/movies\/[^/]+\/watch$/.test(location);
  const isAuthRoute = location === '/login' || location === '/register';
  const isDashboard = location === '/';
  const showNavbar = isAuthenticated && !isWatchRoute && !isAuthRoute;

  return (
    <div className="min-h-screen bg-bg text-fg">
      {showNavbar && <Navbar transparentOnTop={isDashboard} />}
      <main>
        <Suspense fallback={<PageSkeleton />}>
          <Switch>
            <Route path="/login">
              {isAuthenticated ? <Redirect to="/" /> : <Login />}
            </Route>
            <Route path="/register">
              {isAuthenticated ? <Redirect to="/" /> : <Register />}
            </Route>

            <RequireAuth path="/" component={Dashboard} />
            <RequireAuth path="/movies" component={Movies} />
            <RequireAuth path="/movies/new" role="admin" component={MovieForm} />
            <RequireAuth path="/movies/:id/edit" role="admin" component={MovieForm} />
            <RequireAuth path="/movies/:id/watch" component={WatchMovie} />
            <RequireAuth path="/movies/:id" component={MovieDetail} />
            <RequireAuth path="/reviews" component={Reviews} />
            <RequireAuth path="/reviews/new" component={ReviewForm} />
            <RequireAuth path="/reviews/:id/edit" component={ReviewForm} />

            <Route>
              <NotFound />
            </Route>
          </Switch>
        </Suspense>
      </main>
    </div>
  );
}
