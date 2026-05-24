import { Link } from 'wouter';
import { Play, Info, Star } from 'lucide-preact';
import { movies as moviesApi } from '../../api';
import { gradientFor } from '../../lib/posterArt';
import { Button } from '../ui/Button';
import { formatRating, formatDuration, formatYear } from '../../lib/format';

export function MovieHero({ movie }) {
  if (!movie) return null;
  const url = moviesApi.posterUrl(movie.posterImage);
  const rating = formatRating(movie.averageRating);
  const duration = formatDuration(movie.durationMinutes);
  const year = formatYear(movie.releaseDate);

  return (
    <section
      className="relative -mt-16 h-[78vh] min-h-[480px] max-h-[760px] w-full overflow-hidden"
      aria-label="Featured movie"
    >
      <div className="absolute inset-0">
        {url ? (
          <img
            src={url}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover scale-110 blur-[2px] opacity-80"
          />
        ) : (
          <div
            aria-hidden="true"
            className="w-full h-full"
            style={{ background: gradientFor(movie._id || movie.title) }}
          />
        )}
      </div>
      <div className="absolute inset-0 hero-side-fade" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 hero-fade" aria-hidden="true" />

      <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-8 flex items-end pb-20 sm:pb-28">
        <div className="max-w-xl animate-slide-up">
          <p className="text-micro font-bold text-brand-500 mb-3">FEATURED</p>
          <h1 className="text-display-xl text-fg drop-shadow-lg mb-4">{movie.title}</h1>
          <div className="flex items-center gap-3 text-caption text-fg-muted mb-4">
            {rating && (
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                <span className="text-fg font-semibold tabular-nums">{rating}</span>
              </span>
            )}
            {rating && (year || duration) && <span aria-hidden="true">·</span>}
            {year && <span>{year}</span>}
            {year && duration && <span aria-hidden="true">·</span>}
            {duration && <span>{duration}</span>}
          </div>
          {movie.description && (
            <p className="text-body text-fg-muted line-clamp-3 mb-6 leading-relaxed">
              {movie.description}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {movie.videoFilePath && (
              <Button
                as={Link}
                href={`/movies/${movie._id}/watch`}
                variant="primary"
                size="lg"
                leftIcon={Play}
              >
                Watch
              </Button>
            )}
            <Button
              as={Link}
              href={`/movies/${movie._id}`}
              variant="secondary"
              size="lg"
              leftIcon={Info}
            >
              More info
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
