import { useEffect, useState, useRef, useCallback } from 'preact/hooks';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
} from 'lucide-preact';
import { movies as moviesApi } from '../api';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import { cn } from '../lib/cn';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function WatchMovie({ id }) {
  const [movie, setMovie] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const controlsTimerRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [seeking, setSeeking] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  const posterUrl = movie ? moviesApi.posterUrl(movie.posterImage) : null;

  const loadStream = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const movieData = await moviesApi.get(id);
      setMovie(movieData);
      if (!movieData.videoFilePath) {
        setError('This movie has no video file.');
        setLoading(false);
        return;
      }
      const { token } = await moviesApi.getStreamToken(id);
      setStreamUrl(moviesApi.streamUrl(id, token));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStream();
  }, [loadStream]);

  const startHideTimer = useCallback(() => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    setShowControls(true);
    if (playing && !seeking && !speedMenuOpen) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing, seeking, speedMenuOpen]);

  const handlePlay = () => {
    setPlaying(true);
    setStarted(true);
    setBuffering(false);
    startHideTimer();
  };
  const handlePause = () => {
    setPlaying(false);
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
  };
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v && !seeking) {
      setCurrentTime(v.currentTime);
      if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
    }
  };
  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v) setDuration(v.duration);
  };
  const handleWaiting = () => setBuffering(true);
  const handleCanPlay = () => setBuffering(false);

  const seekTo = useCallback(
    (clientX) => {
      const v = videoRef.current;
      const bar = progressBarRef.current;
      if (!v || !bar || duration <= 0) return;
      const rect = bar.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      v.currentTime = fraction * duration;
      setCurrentTime(v.currentTime);
    },
    [duration]
  );

  const handleSeekStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSeeking(true);
    seekTo(e.clientX);
  };

  useEffect(() => {
    if (!seeking) return;
    const onMove = (e) => seekTo(e.clientX);
    const onUp = () => setSeeking(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [seeking, seekTo]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleVolumeChange = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    setVolume(val);
    setMuted(val === 0);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) container.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  };

  const changeSpeed = (s) => {
    const v = videoRef.current;
    if (v) v.playbackRate = s;
    setSpeed(s);
    setSpeedMenuOpen(false);
  };

  const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

  const handleKeyDown = useCallback(
    (e) => {
      const v = videoRef.current;
      if (!v) return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          v.currentTime = Math.max(0, v.currentTime - 10);
          startHideTimer();
          break;
        case 'ArrowRight':
          e.preventDefault();
          v.currentTime = Math.min(v.duration || 0, v.currentTime + 10);
          startHideTimer();
          break;
        case 'ArrowUp':
          e.preventDefault();
          v.volume = Math.min(1, v.volume + 0.1);
          setVolume(v.volume);
          setMuted(false);
          v.muted = false;
          startHideTimer();
          break;
        case 'ArrowDown':
          e.preventDefault();
          v.volume = Math.max(0, v.volume - 0.1);
          setVolume(v.volume);
          setMuted(v.volume === 0);
          startHideTimer();
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.addEventListener('play', handlePlay);
    v.addEventListener('pause', handlePause);
    v.addEventListener('timeupdate', handleTimeUpdate);
    v.addEventListener('loadedmetadata', handleLoadedMetadata);
    v.addEventListener('waiting', handleWaiting);
    v.addEventListener('canplay', handleCanPlay);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      v.removeEventListener('play', handlePlay);
      v.removeEventListener('pause', handlePause);
      v.removeEventListener('timeupdate', handleTimeUpdate);
      v.removeEventListener('loadedmetadata', handleLoadedMetadata);
      v.removeEventListener('waiting', handleWaiting);
      v.removeEventListener('canplay', handleCanPlay);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [handleKeyDown, streamUrl]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Spinner size="xl" label="Loading stream" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        <header className="px-4 py-3 border-b border-border-subtle">
          <Link href={`/movies/${id}`} className="inline-flex items-center gap-2 text-caption text-fg-muted hover:text-fg">
            <ArrowLeft className="w-4 h-4" /> Back to movie
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <ErrorState message={error} onRetry={loadStream} />
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="min-h-screen bg-black">
      <div className="relative flex items-center justify-between px-4 py-3 bg-black/90 border-b border-border-subtle">
        <Link
          href={`/movies/${id}`}
          className="inline-flex items-center gap-2 text-caption text-fg-muted hover:text-fg transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to movie
        </Link>
        <h1 className="text-subheading font-semibold text-fg truncate max-w-md hidden sm:block">
          {movie?.title}
        </h1>
        <div className="w-24" />
      </div>

      <div
        ref={containerRef}
        className="relative w-full flex items-center justify-center bg-black"
        style={{ height: 'calc(100vh - 57px)' }}
        onMouseMove={startHideTimer}
        onMouseLeave={() => {
          if (playing && !speedMenuOpen) setShowControls(false);
        }}
        onClick={(e) => {
          if (e.target === containerRef.current || e.target === e.currentTarget) togglePlay();
        }}
      >
        {streamUrl && (
          <video
            ref={videoRef}
            className={cn(
              'w-full h-full object-contain',
              showControls ? 'cursor-default' : 'cursor-none'
            )}
            autoPlay
            playsInline
            poster={posterUrl}
          >
            <source src={streamUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {!started && !buffering && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Play"
            className="absolute inset-0 flex items-center justify-center z-30 bg-black/40 group/play"
          >
            <span className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center shadow-glow transition-transform group-hover/play:scale-110">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </span>
          </button>
        )}

        {buffering && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <Spinner size="xl" />
          </div>
        )}

        <div
          className={cn(
            'absolute inset-0 z-10 transition-opacity duration-300 pointer-events-none',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />

          <div
            className="absolute inset-x-0 bottom-0 pointer-events-auto"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)',
            }}
          >
            <div
              ref={progressBarRef}
              className="relative w-full h-2 bg-white/20 cursor-pointer group hover:h-3 transition-all"
              onMouseDown={handleSeekStart}
            >
              <div
                className="absolute top-0 left-0 h-full bg-white/30 rounded-r-sm"
                style={{ width: `${bufferedProgress}%` }}
              />
              <div
                className="absolute top-0 left-0 h-full bg-brand-500 rounded-r-sm"
                style={{ width: `${progress}%` }}
              >
                <div
                  className={cn(
                    'absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-brand-500 rounded-full shadow-lg transition-all',
                    showControls ? 'opacity-100' : 'opacity-0',
                    seeking && 'scale-125'
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 pb-3 pt-1.5">
              <button
                onClick={togglePlay}
                className="text-white hover:text-brand-500 transition p-1.5"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>

              <span className="text-caption text-white/80 tabular-nums min-w-[80px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="flex-1" />

              <div className="flex items-center gap-1 group/vol">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-brand-500 transition p-1.5"
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  <VolumeIcon className="w-5 h-5" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onInput={handleVolumeChange}
                  className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-brand-500 h-1 cursor-pointer opacity-0 group-hover/vol:opacity-100"
                  aria-label="Volume"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setSpeedMenuOpen((v) => !v)}
                  className="text-white hover:text-brand-500 transition p-1.5 flex items-center gap-1"
                  aria-label="Playback speed"
                  aria-expanded={speedMenuOpen}
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-caption tabular-nums hidden sm:inline">{speed}×</span>
                </button>
                {speedMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 bottom-full mb-2 w-28 bg-bg-elevated/95 backdrop-blur border border-border-subtle rounded-lg shadow-pop py-1 animate-slide-up"
                  >
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        role="menuitem"
                        onClick={() => changeSpeed(s)}
                        className={cn(
                          'w-full px-3 py-1.5 text-left text-caption transition-colors',
                          s === speed
                            ? 'text-brand-500 font-medium'
                            : 'text-fg-muted hover:text-fg hover:bg-surface-1'
                        )}
                      >
                        {s}×{s === 1 && ' (normal)'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-brand-500 transition p-1.5"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
