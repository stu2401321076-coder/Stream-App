import { Link } from 'wouter';
import { Home } from 'lucide-preact';
import { Button } from '../ui/Button';

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-display-2xl font-extrabold bg-gradient-to-br from-brand-500 to-brand-700 bg-clip-text text-transparent leading-none mb-2">
          404
        </p>
        <h1 className="text-heading text-fg mb-2">Page not found</h1>
        <p className="text-body text-fg-muted mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button as={Link} href="/" variant="primary" leftIcon={Home}>
          Back to home
        </Button>
      </div>
    </div>
  );
}
