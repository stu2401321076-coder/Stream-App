import { cn } from '../../lib/cn';
import { initials } from '../../lib/format';
import { gradientFor } from '../../lib/posterArt';

const SIZES = {
  xs: 'w-6 h-6 text-micro',
  sm: 'w-8 h-8 text-caption',
  md: 'w-10 h-10 text-body',
  lg: 'w-14 h-14 text-subheading',
  xl: 'w-20 h-20 text-heading',
};

export function Avatar({ name, email, src, size = 'md', className }) {
  const display = name || email || '?';
  if (src) {
    return (
      <img
        src={src}
        alt={display}
        className={cn('rounded-full object-cover', SIZES[size], className)}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={display}
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white shadow-card',
        SIZES[size],
        className
      )}
      style={{ background: gradientFor(display) }}
    >
      {initials(display)}
    </div>
  );
}
