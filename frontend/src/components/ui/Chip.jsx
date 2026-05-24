import { X } from 'lucide-preact';
import { cn } from '../../lib/cn';

export function Chip({ children, onRemove, selected = false, onClick, className }) {
  const interactive = onClick || onRemove;
  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-caption transition-colors',
        selected
          ? 'bg-brand-500/15 border-brand-500/40 text-brand-500'
          : 'bg-surface-1 border-border-subtle text-fg-muted hover:border-border',
        interactive && 'cursor-pointer',
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove"
          className="-mr-1 p-0.5 rounded-full hover:bg-surface-3 text-fg-subtle hover:text-fg"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
