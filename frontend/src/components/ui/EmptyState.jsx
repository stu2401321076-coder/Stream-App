import { cn } from '../../lib/cn';

export function EmptyState({ icon: Icon, title, message, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-4',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 w-14 h-14 rounded-full bg-surface-1 border border-border-subtle flex items-center justify-center">
          <Icon className="w-7 h-7 text-fg-subtle" aria-hidden="true" />
        </div>
      )}
      {title && <h3 className="text-heading text-fg mb-1.5">{title}</h3>}
      {message && <p className="text-body text-fg-muted max-w-sm">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
