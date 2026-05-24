import { Skeleton } from '../ui/Skeleton';

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Skeleton className="h-8 w-48 mb-3" />
      <Skeleton className="h-4 w-64 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-poster w-full" />
        ))}
      </div>
    </div>
  );
}
