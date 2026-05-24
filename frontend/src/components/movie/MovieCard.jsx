import { Link } from 'wouter';
import { Play, Pencil, Trash2, Star } from 'lucide-preact';
import { PosterImage } from './PosterImage';
import { cn } from '../../lib/cn';
import { formatRating, formatDuration, formatYear } from '../../lib/format';

export function MovieCard({
  movie,
  variant = 'poster',
  showActions = false,
  isAdmin = false,
  onDelete,
  loading = 'lazy',
  className,
}) {
  const rating = formatRating(movie.averageRating);
  const duration = formatDuration(movie.durationMinutes);
  const year = formatYear(movie.releaseDate);

  return (
    <article
      className={cn(
        'group relative rounded-lg overflow-hidden bg-surface-1 border border-border-subtle',
        'transition-all duration-250 ease-out-expo',
        'hover:border-border hover:shadow-pop hover:-translate-y-0.5',
        'focus-within:border-brand-500',
        className
      )}
    >
      <Link
        href={`/movies/${movie._id}`}
        className="block relative"
      >
        <PosterImage movie={movie} variant={variant} loading={loading} />

        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-black/70 backdrop-blur-sm text-caption text-fg">
            <Star className="w-3 h-3 fill-warning text-warning" />
            <span className="tabular-nums">{rating}</span>
          </div>
        )}

        {movie.videoFilePath && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250 bg-black/40">
            <div className="w-12 h-12 rounded-full bg-brand-500/95 flex items-center justify-center shadow-glow">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}
      </Link>

      <div className="p-3">
        <Link href={`/movies/${movie._id}`} className="block">
          <h3 className="font-semibold text-body text-fg truncate hover:text-brand-500 transition-colors">
            {movie.title}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-2 text-caption text-fg-subtle">
          {year && <span>{year}</span>}
          {year && duration && <span aria-hidden="true">·</span>}
          {duration && <span>{duration}</span>}
        </div>

        {showActions && isAdmin && (
          <div className="mt-3 flex gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
            <Link
              href={`/movies/${movie._id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2 py-1 text-micro rounded bg-surface-2 hover:bg-surface-3 text-fg-muted hover:text-fg transition"
            >
              <Pencil className="w-3 h-3" /> Edit
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.(movie);
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-micro rounded bg-danger/15 hover:bg-danger/25 text-danger transition"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
