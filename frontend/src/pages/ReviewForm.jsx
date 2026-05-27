import { useEffect, useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { Star, Send } from 'lucide-preact';
import { reviews as reviewsApi } from '../api';
import { invalidateCache } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';

export default function ReviewForm({ id }) {
  const isEdit = !!id;
  const [, setLocation] = useLocation();
  const toast = useToast();

  const [form, setForm] = useState({
    movieId: '',
    comment: '',
    rating: 0,
    isSpoiler: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('movieId');
    if (movieId) setForm((prev) => ({ ...prev, movieId }));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await reviewsApi.get(id);
        if (cancelled) return;
        setForm({
          movieId: r.movieId?._id || r.movieId || '',
          comment: r.comment || '',
          rating: Number(r.rating) || 0,
          isSpoiler: !!r.isSpoiler,
        });
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.rating) {
      setError('Please choose a rating from 1 to 10.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        movieId: form.movieId,
        comment: form.comment,
        rating: Number(form.rating),
        isSpoiler: form.isSpoiler,
      };
      if (isEdit) await reviewsApi.update(id, payload);
      else await reviewsApi.create(payload);
      invalidateCache('reviews:');
      invalidateCache(`movie:${form.movieId}:reviews`);
      invalidateCache('movies:');
      invalidateCache('dash:');
      invalidateCache(`movie:${form.movieId}`);
      toast.success(isEdit ? 'Review updated' : 'Review submitted');
      setLocation(`/movies/${form.movieId}`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to save review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader title={isEdit ? 'Edit review' : 'Write a review'} />

        {error && (
          <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 text-danger text-caption px-3 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-bg-elevated border border-border-subtle rounded-xl p-6"
        >
          <Input
            label="Movie ID"
            value={form.movieId}
            onInput={(e) => setForm({ ...form, movieId: e.target.value })}
            required
            placeholder="Paste the movie ID"
            hint="Tip: open a movie, the ID is in the URL."
          />

          <div>
            <label className="block text-caption font-medium text-fg-muted mb-1.5">Rating</label>
            <StarRating
              value={form.rating}
              onChange={(rating) => setForm({ ...form, rating })}
            />
          </div>

          <Textarea
            label="Your review"
            value={form.comment}
            onInput={(e) => setForm({ ...form, comment: e.target.value })}
            required
            maxLength={500}
            placeholder="What did you think?"
          />

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isSpoiler}
              onChange={(e) => setForm({ ...form, isSpoiler: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded bg-surface-1 border-border accent-brand-500"
            />
            <span className="text-caption text-fg-muted">
              <span className="text-fg font-medium">Contains spoilers</span> — readers will need to opt-in to see your comment.
            </span>
          </label>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" variant="primary" loading={loading} leftIcon={Send}>
              {isEdit ? 'Update review' : 'Submit review'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLocation('/reviews')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex items-center gap-2">
      <div className="flex" role="radiogroup" aria-label="Rating">
        {Array.from({ length: 10 }).map((_, i) => {
          const star = i + 1;
          const active = star <= display;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} out of 10`}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onFocus={() => setHover(star)}
              onBlur={() => setHover(0)}
              onClick={() => onChange(star)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'w-6 h-6 transition-colors',
                  active ? 'fill-warning text-warning' : 'text-fg-faint'
                )}
              />
            </button>
          );
        })}
      </div>
      <span className="text-caption text-fg-muted tabular-nums min-w-[3rem]">
        {display ? `${display}/10` : 'No rating'}
      </span>
    </div>
  );
}
