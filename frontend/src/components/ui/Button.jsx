import { Loader2 } from 'lucide-preact';
import { cn } from '../../lib/cn';

const VARIANTS = {
  primary:
    'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-card hover:shadow-glow',
  secondary:
    'bg-surface-2 hover:bg-surface-3 text-fg border border-border-subtle hover:border-border',
  ghost: 'bg-transparent hover:bg-surface-2 text-fg-muted hover:text-fg',
  danger:
    'bg-danger/90 hover:bg-danger text-white shadow-card',
  outline:
    'bg-transparent border border-border hover:bg-surface-1 text-fg',
};

const SIZES = {
  sm: 'h-8 px-3 text-caption gap-1.5',
  md: 'h-10 px-4 text-body gap-2',
  lg: 'h-12 px-6 text-subheading gap-2',
};

export function Button({
  as,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  children,
  type = 'button',
  ...rest
}) {
  const Component = as || 'button';
  return (
    <Component
      type={Component === 'button' ? type : undefined}
      disabled={Component === 'button' ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
        'select-none whitespace-nowrap',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4" aria-hidden="true" />
      )}
      {children}
      {!loading && RightIcon && <RightIcon className="w-4 h-4" aria-hidden="true" />}
    </Component>
  );
}
