import { useState } from 'preact/hooks';
import { Link, useLocation } from 'wouter';
import { Mail, Lock } from 'lucide-preact';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setLocation('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <h1 className="text-brand-500 font-extrabold text-display-lg tracking-tight">STREAMFLIX</h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-bg-elevated/80 backdrop-blur border border-border-subtle rounded-xl p-8 space-y-5 shadow-pop"
      >
        <div>
          <h2 className="text-heading text-fg">Sign In</h2>
          <p className="text-caption text-fg-subtle mt-1">Welcome back. Pick up where you left off.</p>
        </div>

        {error && (
          <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 text-danger text-caption px-3 py-2.5">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onInput={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          maxLength={100}
          placeholder="you@example.com"
          leftIcon={Mail}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onInput={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          leftIcon={Lock}
        />

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="text-center text-caption text-fg-muted">
          Don't have an account?{' '}
          <Link href="/register" className="text-brand-500 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at top left, rgba(229,9,20,0.18), transparent 50%), radial-gradient(ellipse at bottom right, rgba(59,130,246,0.12), transparent 50%), #0a0a0b',
        }}
      />
      <div className="w-full max-w-md animate-slide-up">{children}</div>
    </div>
  );
}
