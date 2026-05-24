import { cn } from '../../lib/cn';

export function Skeleton({ className, style }) {
  return <div className={cn('skeleton rounded-md', className)} style={style} aria-hidden="true" />;
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function PosterSkeleton({ className }) {
  return <Skeleton className={cn('aspect-poster w-full rounded-lg', className)} />;
}
