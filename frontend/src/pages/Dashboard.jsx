import { useMemo } from 'preact/hooks';
import { Link } from 'wouter';
import { movies as moviesApi } from '../api';
import { useApi } from '../hooks/useApi';
import { MovieHero } from '../components/movie/MovieHero';
import { MovieRow } from '../components/movie/MovieRow';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Film, Plus } from 'lucide-preact';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { isAdmin } = useAuth();

  const latest = useApi(
    () => moviesApi.list({ limit: 12, sortBy: 'createdAt', order: 'desc' }),
    [],
    { cacheKey: 'dash:latest' }
  );
  const topRated = useApi(
    () => moviesApi.list({ limit: 12, sortBy: 'averageRating', order: 'desc' }),
    [],
    { cacheKey: 'dash:topRated' }
  );

  const featured = useMemo(() => {
    const fromTop = topRated.data?.data?.find((m) => m.videoFilePath);
    if (fromTop) return fromTop;
    const fromLatest = latest.data?.data?.find((m) => m.videoFilePath);
    if (fromLatest) return fromLatest;
    return latest.data?.data?.[0] || topRated.data?.data?.[0] || null;
  }, [latest.data, topRated.data]);

  const heroLoading = latest.loading && topRated.loading;
  const noContent =
    !heroLoading && !featured && !latest.data?.data?.length && !topRated.data?.data?.length;

  if (noContent) {
    return (
      <div className="pt-16">
        <EmptyState
          icon={Film}
          title="No movies yet"
          message={
            isAdmin
              ? 'Add your first movie to populate the catalog.'
              : 'Check back soon — the catalog is just getting started.'
          }
          action={
            isAdmin && (
              <Button as={Link} href="/movies/new" leftIcon={Plus}>
                Add a movie
              </Button>
            )
          }
        />
      </div>
    );
  }

  return (
    <div>
      {heroLoading ? <HeroSkeleton /> : <MovieHero movie={featured} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 space-y-10 -mt-12 sm:-mt-16 relative z-10">
        <MovieRow
          title="Recently added"
          action={
            <Link href="/movies" className="text-caption text-fg-muted hover:text-fg">
              View all →
            </Link>
          }
          movies={latest.data?.data}
          loading={latest.loading && !latest.data}
          emptyHint="Nothing here yet."
        />
        <MovieRow
          title="Top rated"
          movies={topRated.data?.data?.filter((m) => Number(m.averageRating) > 0)}
          loading={topRated.loading && !topRated.data}
          emptyHint="No rated movies yet."
        />
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="relative -mt-16 h-[78vh] min-h-[480px] max-h-[760px] w-full overflow-hidden">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 hero-fade" />
      <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-8 flex items-end pb-20">
        <div className="max-w-xl w-full space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-28" />
            <Skeleton className="h-11 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
