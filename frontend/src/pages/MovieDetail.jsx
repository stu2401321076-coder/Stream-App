import { useState } from 'preact/hooks';
import { Link } from 'wouter';
import { Play, Pencil, ArrowLeft, Star, Plus, Calendar, Clock } from 'lucide-preact';
import { movies as moviesApi, reviews as reviewsApi } from '../api';
import { useApi, invalidateCache } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton, SkeletonText } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ReviewItem } from '../components/movie/ReviewItem';
import { PosterImage } from '../components/movie/PosterImage';
import { gradientFor } from '../lib/posterArt';
import { formatRating, formatDuration, formatYear, formatDateLong } from '../lib/format';

export default function MovieDetail({ id }) {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [pendingReview, setPendingReview] = useState(null);

  const movieQ = useApi(() => moviesApi.get(id), [id], { cacheKey: `movie:${id}` });
  const reviewsQ = useApi(
    () => reviewsApi.list({ movieId: id, limit: 10, sortBy: 'createdAt', order: 'desc' }),
    [id],
    { cacheKey: `movie:${id}:reviews` }
  );

  if (movieQ.loading && !movieQ.data) return <DetailSkeleton />;
  if (movieQ.error) {
    return (
      <div className="pt-20 px-4">
        <ErrorState message={movieQ.error.message} onRetry={movieQ.refetch} />
      </div>
    );
  }

  const movie = movieQ.data;
  if (!movie) {
    return (
      <div className="pt-20 px-4">
        <EmptyState title="Movie not found" message="It may have been removed." />
      </div>
    );
  }

  const rating = formatRating(movie.averageRating);
  const duration = formatDuration(movie.durationMinutes);
  const year = formatYear(movie.releaseDate);
  const backdropUrl = moviesApi.posterUrl(movie.posterImage);

  const handleDeleteReview = async () => {
    if (!pendingReview) return;
    try {
      await reviewsApi.delete(pendingReview._id);
      invalidateCache(`movie:${id}:reviews`);
      reviewsQ.refetch();
      toast.success('Review deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    } finally {
      setPendingReview(null);
    }
  };

  return (
    <div>
      <section className="relative h-[55vh] min-h-[360px] max-h-[560px] -mt-16 overflow-hidden">
        <div className="absolute inset-0">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover scale-110 blur-sm opacity-70"
            />
          ) : (
            <div
              aria-hidden="true"
              className="w-full h-full"
              style={{ background: gradientFor(movie._id) }}
            />
          )}
        </div>
        <div className="absolute inset-0 hero-side-fade" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 hero-fade" />
        <div className="absolute top-20 left-4 sm:left-6">
          <Button as={Link} href="/movies" variant="ghost" size="sm" leftIcon={ArrowLeft}>
            Back to movies
          </Button>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-40 sm:-mt-48 relative z-10 pb-16">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
          <div className="w-40 sm:w-56 flex-shrink-0 rounded-lg overflow-hidden shadow-hero">
            <PosterImage movie={movie} loading="eager" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-display-lg sm:text-display-xl text-fg drop-shadow-lg">{movie.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-caption text-fg-muted">
              {rating && (
                <span className="inline-flex items-center gap-1">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span className="text-fg font-semibold tabular-nums">{rating}</span>
                </span>
              )}
              {year && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {year}
                </span>
              )}
              {duration && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {duration}
                </span>
              )}
            </div>
            {movie.description && (
              <p className="mt-4 text-body text-fg-muted leading-relaxed max-w-3xl">
                {movie.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {movie.videoFilePath ? (
                <Button as={Link} href={`/movies/${movie._id}/watch`} variant="primary" size="lg" leftIcon={Play}>
                  Watch
                </Button>
              ) : (
                <Badge variant="warning">No video uploaded</Badge>
              )}
              {isAdmin && (
                <Button as={Link} href={`/movies/${movie._id}/edit`} variant="secondary" leftIcon={Pencil}>
                  Edit
                </Button>
              )}
            </div>

            {movie.releaseDate && (
              <p className="mt-4 text-caption text-fg-subtle">
                Released {formatDateLong(movie.releaseDate)}
              </p>
            )}
          </div>
        </div>

        <section className="mt-12">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-heading text-fg">
              Reviews{' '}
              {reviewsQ.data?.pagination?.total > 0 && (
                <span className="text-fg-subtle font-normal">
                  ({reviewsQ.data.pagination.total})
                </span>
              )}
            </h2>
            <Button
              as={Link}
              href={`/reviews/new?movieId=${movie._id}`}
              variant="primary"
              size="sm"
              leftIcon={Plus}
            >
              Write a review
            </Button>
          </div>

          {reviewsQ.loading && !reviewsQ.data ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
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
          ) : reviewsQ.error ? (
            <ErrorState message={reviewsQ.error.message} onRetry={reviewsQ.refetch} />
          ) : !reviewsQ.data?.data?.length ? (
            <EmptyState
              title="No reviews yet"
              message="Be the first to share what you thought."
              action={
                <Button as={Link} href={`/reviews/new?movieId=${movie._id}`} leftIcon={Plus}>
                  Write a review
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {reviewsQ.data.data.map((review) => (
                <ReviewItem
                  key={review._id}
                  review={review}
                  canEdit={isAdmin || review.userId?._id === user?._id}
                  onDelete={setPendingReview}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={!!pendingReview}
        onClose={() => setPendingReview(null)}
        onConfirm={handleDeleteReview}
        title="Delete this review?"
        message="This can't be undone."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div>
      <div className="relative h-[55vh] min-h-[360px] max-h-[560px] -mt-16 overflow-hidden">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 hero-fade" />
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-40 sm:-mt-48 relative z-10 pb-16">
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <Skeleton className="w-40 sm:w-56 aspect-poster rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <SkeletonText lines={4} />
            <div className="flex gap-3 pt-3">
              <Skeleton className="h-11 w-28" />
              <Skeleton className="h-11 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
