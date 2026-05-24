import { AlertCircle, RotateCw } from 'lucide-preact';
import { Button } from './Button';
import { cn } from '../../lib/cn';

export function ErrorState({ title = 'Something went wrong', message, onRetry, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-4', className)}>
      <div className="mb-4 w-14 h-14 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-danger" aria-hidden="true" />
      </div>
      <h3 className="text-heading text-fg mb-1.5">{title}</h3>
      {message && <p className="text-body text-fg-muted max-w-sm">{message}</p>}
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" leftIcon={RotateCw} onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
