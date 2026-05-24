import { useRef, useState, useEffect, useCallback } from 'preact/hooks';
import { ChevronLeft, ChevronRight } from 'lucide-preact';
import { MovieCard } from './MovieCard';
import { PosterSkeleton } from '../ui/Skeleton';
import { cn } from '../../lib/cn';

export function MovieRow({ title, action, movies, loading, emptyHint, className }) {
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateButtons();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    return () => {
      el.removeEventListener('scroll', updateButtons);
      window.removeEventListener('resize', updateButtons);
    };
  }, [updateButtons, movies]);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section className={cn('group/row relative', className)}>
      <div className="flex items-end justify-between mb-3 px-1">
        <h2 className="text-heading text-fg">{title}</h2>
        {action}
      </div>

      <div className="relative">
        {canPrev && (
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-12 items-center justify-center bg-gradient-to-r from-bg via-bg/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <span className="w-9 h-9 rounded-full bg-bg-elevated/90 border border-border-subtle flex items-center justify-center text-fg hover:bg-surface-2">
              <ChevronLeft className="w-5 h-5" />
            </span>
          </button>
        )}
        {canNext && (
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-12 items-center justify-center bg-gradient-to-l from-bg via-bg/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <span className="w-9 h-9 rounded-full bg-bg-elevated/90 border border-border-subtle flex items-center justify-center text-fg hover:bg-surface-2">
              <ChevronRight className="w-5 h-5" />
            </span>
          </button>
        )}

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hidden snap-x snap-mandatory pb-2 -mx-1 px-1"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="snap-start flex-shrink-0 w-36 sm:w-44">
                  <PosterSkeleton />
                </div>
              ))
            : movies?.length
            ? movies.map((m, i) => (
                <div key={m._id} className="snap-start flex-shrink-0 w-36 sm:w-44">
                  <MovieCard movie={m} loading={i < 4 ? 'eager' : 'lazy'} />
                </div>
              ))
            : emptyHint && (
                <p className="text-body text-fg-subtle px-1 py-8">{emptyHint}</p>
              )}
        </div>
      </div>
    </section>
  );
}
