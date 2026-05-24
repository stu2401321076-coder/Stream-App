import { useEffect, useState, useMemo } from 'preact/hooks';
import { Link, useSearch } from 'wouter';
import { Search, SlidersHorizontal, Plus, Film } from 'lucide-preact';
import { movies as moviesApi } from '../api';
import { useApi, invalidateCache } from '../hooks/useApi';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Chip } from '../components/ui/Chip';
import { PosterSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { MovieCard } from '../components/movie/MovieCard';

const PAGE_SIZE = 18;

export default function Movies() {
  const search = useSearch();
  const initialTitle = useMemo(() => new URLSearchParams(search).get('title') || '', [search]);

  const { isAdmin } = useAuth();
  const toast = useToast();

  const [titleInput, setTitleInput] = useState(initialTitle);
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    setTitleInput(initialTitle);
  }, [initialTitle]);

  const debouncedTitle = useDebouncedValue(titleInput, 300);

  useEffect(() => {
    setPage(1);
    setAccumulated([]);
  }, [debouncedTitle, minRating, sortBy, order]);

  const params = { page, limit: PAGE_SIZE, sortBy, order };
  if (debouncedTitle) params.title = debouncedTitle;
  if (minRating) params.minRating = minRating;

  const cacheKey = `movies:list:${JSON.stringify(params)}`;

  const { data, loading, error, refetch } = useApi(
    () => moviesApi.list(params),
    [page, debouncedTitle, minRating, sortBy, order],
    { cacheKey }
  );

  useEffect(() => {
    if (!data?.data) return;
    setAccumulated((prev) => {
      if (page === 1) return data.data;
      const seen = new Set(prev.map((m) => m._id));
      return [...prev, ...data.data.filter((m) => !seen.has(m._id))];
    });
  }, [data, page]);

  const pagination = data?.pagination || { page: 1, totalPages: 0, total: 0 };
  const hasMore = pagination.page < pagination.totalPages;

  const sortOptions = [
    { value: 'createdAt', label: 'Date added' },
    { value: 'title', label: 'Title' },
    { value: 'averageRating', label: 'Rating' },
    { value: 'releaseDate', label: 'Release date' },
  ];

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await moviesApi.delete(pendingDelete._id);
      invalidateCache('movies:');
      invalidateCache('dash:');
      setAccumulated((prev) => prev.filter((m) => m._id !== pendingDelete._id));
      toast.success(`Deleted "${pendingDelete.title}"`);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setPendingDelete(null);
    }
  };

  const activeFilters = [
    debouncedTitle && { key: 'title', label: `"${debouncedTitle}"`, clear: () => setTitleInput('') },
    minRating && { key: 'rating', label: `★ ≥ ${minRating}`, clear: () => setMinRating('') },
  ].filter(Boolean);

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Movies"
          subtitle={pagination.total ? `${pagination.total} titles in the catalog` : undefined}
          actions={
            isAdmin && (
              <Button as={Link} href="/movies/new" variant="primary" leftIcon={Plus}>
                Add movie
              </Button>
            )
          }
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <Input
              type="search"
              value={titleInput}
              onInput={(e) => setTitleInput(e.target.value)}
              placeholder="Search by title…"
              leftIcon={Search}
              maxLength={150}
              aria-label="Search by title"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={`${sortBy}:${order}`}
              onChange={(e) => {
                const [s, o] = e.target.value.split(':');
                setSortBy(s);
                setOrder(o);
              }}
              aria-label="Sort movies"
              className="min-w-[12rem]"
            >
              {sortOptions.flatMap((opt) => [
                <option key={`${opt.value}:desc`} value={`${opt.value}:desc`}>
                  {opt.label} ↓
                </option>,
                <option key={`${opt.value}:asc`} value={`${opt.value}:asc`}>
                  {opt.label} ↑
                </option>,
              ])}
            </Select>
            <Button
              variant={showFilters ? 'secondary' : 'outline'}
              leftIcon={SlidersHorizontal}
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
            >
              Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4 mb-4 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Minimum rating"
                type="number"
                value={minRating}
                onInput={(e) => setMinRating(e.target.value)}
                min={0}
                max={10}
                step="0.1"
                placeholder="0 – 10"
              />
            </div>
          </div>
        )}

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {activeFilters.map((f) => (
              <Chip key={f.key} onRemove={f.clear}>
                {f.label}
              </Chip>
            ))}
            <button
              type="button"
              onClick={() => {
                setTitleInput('');
                setMinRating('');
              }}
              className="text-caption text-fg-subtle hover:text-fg ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {error ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : page === 1 && loading && accumulated.length === 0 ? (
          <SkeletonGrid />
        ) : accumulated.length === 0 ? (
          <EmptyState
            icon={Film}
            title="No movies found"
            message={
              activeFilters.length
                ? 'Try removing some filters.'
                : 'The catalog is empty for now.'
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {accumulated.map((movie, i) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  showActions
                  isAdmin={isAdmin}
                  onDelete={setPendingDelete}
                  loading={i < 6 ? 'eager' : 'lazy'}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <Button
                  variant="secondary"
                  size="lg"
                  loading={loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete movie?"
        message={
          pendingDelete && (
            <span>
              This will permanently delete <span className="text-fg font-semibold">"{pendingDelete.title}"</span> and its reviews. This can't be undone.
            </span>
          )
        }
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <PosterSkeleton />
          <div className="h-4 w-3/4 skeleton rounded" />
          <div className="h-3 w-1/2 skeleton rounded" />
        </div>
      ))}
    </div>
  );
}
