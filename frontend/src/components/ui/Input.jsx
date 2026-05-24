import { useState, useId } from 'preact/hooks';
import { Eye, EyeOff } from 'lucide-preact';
import { cn } from '../../lib/cn';

const baseField =
  'w-full bg-surface-1 border border-border-subtle text-fg placeholder:text-fg-faint rounded-md ' +
  'transition-colors duration-150 ' +
  'hover:border-border focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export function Input({
  label,
  hint,
  error,
  leftIcon: LeftIcon,
  rightSlot,
  type = 'text',
  className,
  id,
  ...rest
}) {
  const autoId = useId();
  const fieldId = id || autoId;
  const isPassword = type === 'password';
  const [show, setShow] = useState(false);
  const effectiveType = isPassword && show ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="block text-caption font-medium text-fg-muted mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <LeftIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle pointer-events-none"
            aria-hidden="true"
          />
        )}
        <input
          id={fieldId}
          type={effectiveType}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(
            baseField,
            'h-10 text-body',
            LeftIcon && 'pl-9',
            (isPassword || rightSlot) && 'pr-10',
            !LeftIcon && 'pl-3',
            error && 'border-danger focus:border-danger focus:ring-danger/30',
            className
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-fg-subtle hover:text-fg rounded transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        {!isPassword && rightSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-caption text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-caption text-fg-subtle">
          {hint}
        </p>
      )}
    </div>
  );
}

export function Textarea({ label, hint, error, className, id, maxLength, value, ...rest }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="block text-caption font-medium text-fg-muted mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        value={value}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(
          baseField,
          'min-h-[7rem] py-2.5 px-3 text-body resize-y',
          error && 'border-danger focus:border-danger focus:ring-danger/30',
          className
        )}
        {...rest}
      />
      <div className="mt-1.5 flex items-start justify-between gap-2">
        <div>
          {error && (
            <p id={`${fieldId}-error`} className="text-caption text-danger">
              {error}
            </p>
          )}
          {!error && hint && <p className="text-caption text-fg-subtle">{hint}</p>}
        </div>
        {maxLength && (
          <p className="text-caption text-fg-faint tabular-nums">
            {(value || '').length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

export function Select({ label, hint, error, options = [], children, className, id, ...rest }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="block text-caption font-medium text-fg-muted mb-1.5">
          {label}
        </label>
      )}
      <select
        id={fieldId}
        aria-invalid={!!error}
        className={cn(
          baseField,
          'h-10 pl-3 pr-8 text-body appearance-none cursor-pointer',
          'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%23a1a1aa\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E")] bg-no-repeat bg-[length:1.1rem] bg-[position:right_0.5rem_center]',
          error && 'border-danger focus:border-danger focus:ring-danger/30',
          className
        )}
        {...rest}
      >
        {children ?? options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-caption text-danger">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-caption text-fg-subtle">{hint}</p>}
    </div>
  );
}
