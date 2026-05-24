import { Loader2 } from 'lucide-preact';
import { cn } from '../../lib/cn';

const SIZES = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10', xl: 'w-16 h-16' };

export function Spinner({ size = 'md', className, label = 'Loading' }) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn('animate-spin text-brand-500', SIZES[size], className)}
    />
  );
}
