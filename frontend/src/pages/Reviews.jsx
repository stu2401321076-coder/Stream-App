import { useEffect, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { Plus, MessageSquare } from 'lucide-preact';
import { reviews as reviewsApi } from '../api';
import { useApi, invalidateCache } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { Skeleton, SkeletonText } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ReviewItem } from '../components/movie/ReviewItem';

const PAGE_SIZE = 10;

export default function Reviews() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [sortBy, order, minRating]);

  const params = { page, limit: PAGE_SIZE, sortBy, order, minRating };
  const { data, loading, error, refetch } = useApi(
    () => reviewsApi.list(params),
    [page, sortBy, order, minRating],
    { cacheKey: `reviews:list:${JSON.stringify(params)}` }
  );

  const pagination = data?.pagination || { page: 1, totalPages: 0, total: 0 };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await reviewsApi.delete(pendingDelete._id);
      invalidateCache('reviews:');
      invalidateCache('movies:');
      invalidateCache('dash:');
      const deletedMovieId = pendingDelete.movieId?._id || pendingDelete.movieId;
      if (deletedMovieId) {
        invalidateCache(`movie:${deletedMovieId}`);
      }
      refetch();
      toast.success('Review deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Reviews"
          subtitle={pagination.total ? `${pagination.total} reviews from the community` : undefined}
          actions={
            <Button as={Link} href="/reviews/new" variant="primary" leftIcon={Plus}>
              Write a review
            </Button>
          }
        />

        <div className="flex flex-wrap justify-end gap-3 mb-5">
          <Select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            aria-label="Filter reviews by rating"
            className="max-w-xs"
          >
            <option value="">All ratings</option>
            <option value="9">9+ ★</option>
            <option value="8">8+ ★</option>
            <option value="7">7+ ★</option>
            <option value="6">6+ ★</option>
            <option value="4">4+ ★</option>
            <option value="2">2+ ★</option>
          </Select>
          <Select
            value={`${sortBy}:${order}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split(':');
              setSortBy(s);
              setOrder(o);
            }}
            aria-label="Sort reviews"
            className="max-w-xs"
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="rating:desc">Rating: high → low</option>
            <option value="rating:asc">Rating: low → high</option>
          </Select>
        </div>

        {error ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : loading && !data ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-border-subtle bg-surface-1 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-32 mb-1.5" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <SkeletonText lines={2} />
              </div>
            ))}
          </div>
        ) : !data?.data?.length ? (
          <EmptyState
            icon={MessageSquare}
            title="No reviews yet"
            message="Be the first to share what you thought."
            action={
              <Button as={Link} href="/reviews/new" leftIcon={Plus}>
                Write a review
              </Button>
            }
          />
        ) : (
          <>
            <div className="space-y-3">
              {data.data.map((r) => (
                <ReviewItem
                  key={r._id}
                  review={r}
                  showMovieLink
                  canEdit={isAdmin || r.userId?._id === user?._id}
                  onDelete={setPendingDelete}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-caption text-fg-muted tabular-nums">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= pagination.totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete this review?"
        message="This can't be undone."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
