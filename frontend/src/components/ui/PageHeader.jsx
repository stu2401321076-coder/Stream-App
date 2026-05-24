import { cn } from '../../lib/cn';

export function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6',
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-display-lg text-fg truncate">{title}</h1>
        {subtitle && <p className="text-body text-fg-muted mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
