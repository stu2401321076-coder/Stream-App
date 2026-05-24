import { useState } from 'preact/hooks';
import { Film } from 'lucide-preact';
import { movies as moviesApi } from '../../api';
import { gradientFor } from '../../lib/posterArt';
import { cn } from '../../lib/cn';

export function PosterImage({
  movie,
  variant = 'poster',
  loading = 'lazy',
  className,
}) {
  const url = moviesApi.posterUrl(movie?.posterImage);
  const [errored, setErrored] = useState(false);
  const aspect = variant === 'backdrop' ? 'aspect-backdrop' : 'aspect-poster';
  const seed = movie?._id || movie?.title || 'x';

  if (url && !errored) {
    return (
      <div className={cn('relative overflow-hidden bg-surface-1', aspect, className)}>
        <img
          src={url}
          alt={movie?.title || ''}
          loading={loading}
          decoding="async"
          onError={() => setErrored(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden flex items-center justify-center',
        aspect,
        className
      )}
      style={{ background: gradientFor(seed) }}
      aria-label={movie?.title || 'Poster'}
    >
      <Film className="w-1/4 h-1/4 text-white/30" aria-hidden="true" />
      {movie?.title && (
        <div className="absolute inset-0 flex items-end p-3">
          <span className="text-white/80 text-caption font-semibold line-clamp-2 drop-shadow">
            {movie.title}
          </span>
        </div>
      )}
    </div>
  );
}
