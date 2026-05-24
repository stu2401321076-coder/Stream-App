import { useState } from 'preact/hooks';
import { Link } from 'wouter';
import { Star, Pencil, Trash2, EyeOff, Eye } from 'lucide-preact';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { formatRelative } from '../../lib/format';
import { cn } from '../../lib/cn';

export function ReviewItem({ review, canEdit = false, onDelete, showMovieLink = false }) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const isSpoiler = review.isSpoiler && !spoilerRevealed;
  const user = review.userId;
  const movie = review.movieId;

  return (
    <article className="bg-surface-1 border border-border-subtle rounded-lg p-4 transition-colors hover:border-border">
      <header className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={user?.name} email={user?.email} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-caption font-medium text-fg truncate">
                {user?.name || user?.email || 'Unknown'}
              </p>
              <span className="inline-flex items-center gap-0.5 text-caption text-warning font-semibold tabular-nums">
                <Star className="w-3 h-3 fill-warning text-warning" />
                {review.rating}
              </span>
              {review.isSpoiler && (
                <Badge variant="danger" size="sm">
                  Spoiler
                </Badge>
              )}
            </div>
            <p className="text-caption text-fg-subtle">{formatRelative(review.createdAt)}</p>
          </div>
        </div>
        {showMovieLink && movie?._id && (
          <Link
            href={`/movies/${movie._id}`}
            className="text-caption text-brand-500 hover:underline truncate max-w-[12rem]"
          >
            {movie.title}
          </Link>
        )}
      </header>

      <div className="relative">
        <p
          className={cn(
            'text-body text-fg-muted leading-relaxed transition-all',
            isSpoiler && 'blur-md select-none'
          )}
        >
          {review.comment}
        </p>
        {isSpoiler && (
          <button
            type="button"
            onClick={() => setSpoilerRevealed(true)}
            className="absolute inset-0 flex items-center justify-center gap-1.5 text-caption font-medium text-fg bg-bg-overlay/40 rounded hover:bg-bg-overlay/60 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Show spoiler
          </button>
        )}
        {review.isSpoiler && spoilerRevealed && (
          <button
            type="button"
            onClick={() => setSpoilerRevealed(false)}
            className="mt-2 inline-flex items-center gap-1.5 text-caption text-fg-subtle hover:text-fg-muted"
          >
            <EyeOff className="w-3.5 h-3.5" /> Hide spoiler
          </button>
        )}
      </div>

      {canEdit && (
        <footer className="mt-3 flex items-center gap-3">
          <Link
            href={`/reviews/${review._id}/edit`}
            className="inline-flex items-center gap-1 text-caption text-fg-subtle hover:text-fg transition-colors"
          >
            <Pencil className="w-3 h-3" /> Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete?.(review)}
            className="inline-flex items-center gap-1 text-caption text-danger hover:text-danger/80 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </footer>
      )}
    </article>
  );
}
