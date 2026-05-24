import { useEffect, useState, useRef } from 'preact/hooks';
import { useLocation } from 'wouter';
import { Upload, Film, Image as ImageIcon, X } from 'lucide-preact';
import { movies as moviesApi } from '../api';
import { invalidateCache } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/cn';

export default function MovieForm({ id }) {
  const isEdit = !!id;
  const [, setLocation] = useLocation();
  const toast = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    releaseDate: '',
    durationMinutes: '',
  });
  const [video, setVideo] = useState(null);
  const [poster, setPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [existingPoster, setExistingPoster] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const movie = await moviesApi.get(id);
        if (cancelled) return;
        setForm({
          title: movie.title || '',
          description: movie.description || '',
          releaseDate: movie.releaseDate ? movie.releaseDate.slice(0, 10) : '',
          durationMinutes: movie.durationMinutes || '',
        });
        setExistingPoster(moviesApi.posterUrl(movie.posterImage));
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  useEffect(() => {
    if (!poster) {
      setPosterPreview(null);
      return;
    }
    const url = URL.createObjectURL(poster);
    setPosterPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [poster]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      if (form.releaseDate) fd.append('releaseDate', form.releaseDate);
      if (form.durationMinutes) fd.append('durationMinutes', form.durationMinutes);
      if (video) fd.append('video', video);
      if (poster) fd.append('poster', poster);

      if (isEdit) {
        await moviesApi.update(id, fd);
      } else {
        await moviesApi.create(fd);
      }
      invalidateCache('movies:');
      invalidateCache('dash:');
      invalidateCache(`movie:${id}`);
      toast.success(isEdit ? 'Movie updated' : 'Movie created');
      setLocation('/movies');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to save movie');
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader title={isEdit ? 'Edit movie' : 'Add a new movie'} />

        {error && (
          <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 text-danger text-caption px-3 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-bg-elevated border border-border-subtle rounded-xl p-6"
        >
          <Input
            label="Title"
            value={form.title}
            onInput={(e) => setForm({ ...form, title: e.target.value })}
            required
            maxLength={150}
            placeholder="The Matrix"
          />

          <Textarea
            label="Description"
            value={form.description}
            onInput={(e) => setForm({ ...form, description: e.target.value })}
            required
            maxLength={1000}
            placeholder="A brief synopsis…"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Release date"
              type="date"
              value={form.releaseDate}
              onInput={(e) => setForm({ ...form, releaseDate: e.target.value })}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              min={0}
              value={form.durationMinutes}
              onInput={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              placeholder="120"
            />
          </div>

          <FileDrop
            label="Poster image"
            accept="image/*"
            icon={ImageIcon}
            hint="JPG, PNG, or WebP. Portrait (2:3) works best."
            file={poster}
            onChange={setPoster}
            preview={
              posterPreview || existingPoster ? (
                <img
                  src={posterPreview || existingPoster}
                  alt="Poster preview"
                  className="w-24 h-36 object-cover rounded-md border border-border-subtle"
                />
              ) : null
            }
          />

          <FileDrop
            label="Video file"
            accept="video/mp4"
            icon={Film}
            hint="MP4 only."
            file={video}
            onChange={setVideo}
          />

          {uploadProgress != null && (
            <div className="rounded-md bg-surface-1 border border-border-subtle p-3">
              <div className="flex items-center justify-between text-caption text-fg-muted mb-1.5">
                <span>Uploading…</span>
                <span className="tabular-nums">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" variant="primary" loading={loading} leftIcon={Upload}>
              {isEdit ? 'Update movie' : 'Create movie'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLocation('/movies')}
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

function FileDrop({ label, accept, icon: Icon, hint, file, onChange, preview }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    if (files?.[0]) onChange(files[0]);
  };

  return (
    <div>
      <label className="block text-caption font-medium text-fg-muted mb-1.5">{label}</label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          'flex items-center gap-4 px-4 py-4 rounded-md border-2 border-dashed transition-colors cursor-pointer',
          dragging
            ? 'border-brand-500 bg-brand-500/5'
            : 'border-border-subtle bg-surface-1 hover:border-border hover:bg-surface-2'
        )}
      >
        {preview ? (
          <div className="flex-shrink-0">{preview}</div>
        ) : (
          <div className="w-12 h-12 rounded-md bg-surface-2 flex items-center justify-center text-fg-subtle flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {file ? (
            <>
              <p className="text-body text-fg truncate font-medium">{file.name}</p>
              <p className="text-caption text-fg-subtle">
                {(file.size / 1024 / 1024).toFixed(1)} MB · Click to replace
              </p>
            </>
          ) : (
            <>
              <p className="text-body text-fg">
                <span className="text-brand-500 font-medium">Choose a file</span>{' '}
                <span className="text-fg-muted">or drag it here</span>
              </p>
              <p className="text-caption text-fg-subtle">{hint}</p>
            </>
          )}
        </div>
        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            aria-label={`Remove ${label}`}
            className="p-1.5 rounded text-fg-subtle hover:text-fg hover:bg-surface-3"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
