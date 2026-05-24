import { cn } from '../../lib/cn';

const VARIANTS = {
  neutral: 'bg-surface-2 text-fg-muted border-border-subtle',
  brand: 'bg-brand-500/15 text-brand-500 border-brand-500/30',
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
  outline: 'bg-transparent text-fg-muted border-border',
};

const SIZES = {
  sm: 'text-micro px-1.5 py-0.5',
  md: 'text-caption px-2 py-0.5',
};

export function Badge({ variant = 'neutral', size = 'md', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border font-medium uppercase tracking-wide',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {children}
    </span>
  );
}
