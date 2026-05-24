import { useState, useMemo } from 'preact/hooks';
import { Link, useLocation } from 'wouter';
import { User, Mail, Lock, Calendar } from 'lucide-preact';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AuthShell } from './Login';
import { cn } from '../lib/cn';

function scorePassword(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['bg-surface-3', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success'];

export default function Register() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => scorePassword(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const extra = {};
      if (birthDate) extra.birthDate = birthDate;
      await register(name, email, password, extra);
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
          <h2 className="text-heading text-fg">Create your account</h2>
          <p className="text-caption text-fg-subtle mt-1">It only takes a minute.</p>
        </div>

        {error && (
          <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 text-danger text-caption px-3 py-2.5">
            {error}
          </div>
        )}

        <Input
          label="Name"
          value={name}
          onInput={(e) => setName(e.target.value)}
          required
          maxLength={150}
          autoComplete="name"
          placeholder="Your full name"
          leftIcon={User}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onInput={(e) => setEmail(e.target.value)}
          required
          maxLength={100}
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={Mail}
        />
        <div>
          <Input
            label="Password"
            type="password"
            value={password}
            onInput={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            maxLength={255}
            autoComplete="new-password"
            placeholder="Min 6 characters"
            leftIcon={Lock}
            hint={password ? STRENGTH_LABEL[strength] : 'Mix letters, numbers, and symbols for a stronger password.'}
          />
          {password && (
            <div className="mt-2 flex gap-1" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    i < strength ? STRENGTH_COLOR[strength] : 'bg-surface-2'
                  )}
                />
              ))}
            </div>
          )}
        </div>
        <Input
          label="Birth date (optional)"
          type="date"
          value={birthDate}
          onInput={(e) => setBirthDate(e.target.value)}
          leftIcon={Calendar}
        />

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-caption text-fg-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-500 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
