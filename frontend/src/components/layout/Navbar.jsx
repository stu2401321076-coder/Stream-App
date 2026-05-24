import { useState, useRef, useEffect } from 'preact/hooks';
import { Link, useLocation } from 'wouter';
import { Search, Menu, X, LogOut, ChevronDown, Plus } from 'lucide-preact';
import { useAuth } from '../../context/AuthContext';
import { useScrolled } from '../../hooks/useScrolled';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/cn';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/reviews', label: 'Reviews' },
];

export function Navbar({ transparentOnTop = false }) {
  const { user, isAdmin, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const scrolled = useScrolled(40);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebouncedValue(searchValue, 350);
  const userMenuRef = useRef(null);
  const lastNav = useRef('');

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!debouncedSearch.trim()) return;
    const target = `/movies?title=${encodeURIComponent(debouncedSearch.trim())}`;
    if (lastNav.current === target) return;
    lastNav.current = target;
    setLocation(target);
  }, [debouncedSearch, setLocation]);

  const solid = scrolled || !transparentOnTop || menuOpen;

  return (
    <nav
      className={cn(
        'fixed top-0 inset-x-0 z-20 transition-all duration-250',
        solid
          ? 'bg-bg-elevated/90 backdrop-blur-md border-b border-border-subtle'
          : 'bg-gradient-to-b from-black/70 to-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-brand-500 font-extrabold text-xl tracking-tight"
        >
          STREAMFLIX
        </Link>

        <div className="hidden md:flex items-center gap-1 ml-4">
          {LINKS.map((link) => {
            const active = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-md text-caption font-medium transition-colors',
                  active ? 'text-fg bg-surface-1' : 'text-fg-muted hover:text-fg hover:bg-surface-1'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex-1" />

        <div className="hidden sm:block relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle pointer-events-none" />
          <input
            type="search"
            value={searchValue}
            onInput={(e) => setSearchValue(e.target.value)}
            placeholder="Search titles…"
            aria-label="Search movies"
            className="w-44 lg:w-64 h-9 pl-8 pr-3 rounded-md bg-surface-1/80 border border-border-subtle text-caption text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
          />
        </div>

        {isAdmin && (
          <Link
            href="/movies/new"
            className="hidden sm:inline-flex h-9 items-center gap-1.5 px-3 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-caption font-medium transition"
          >
            <Plus className="w-4 h-4" /> Add
          </Link>
        )}

        {user && (
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              aria-label="User menu"
              className="flex items-center gap-2 p-1 rounded-md hover:bg-surface-1 transition"
            >
              <Avatar name={user.name} email={user.email} size="sm" />
              <ChevronDown
                className={cn(
                  'hidden sm:block w-4 h-4 text-fg-muted transition-transform',
                  userMenuOpen && 'rotate-180'
                )}
              />
            </button>
            {userMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 rounded-lg border border-border-subtle bg-bg-elevated shadow-pop p-2 animate-slide-up"
              >
                <div className="px-3 py-2 border-b border-border-subtle mb-1">
                  <p className="text-body font-medium text-fg truncate">{user.name || 'User'}</p>
                  <p className="text-caption text-fg-subtle truncate">{user.email}</p>
                  {isAdmin && (
                    <div className="mt-2">
                      <Badge variant="brand" size="sm">Admin</Badge>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-caption text-fg-muted hover:bg-surface-1 hover:text-fg transition"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="md:hidden p-2 -mr-2 text-fg-muted hover:text-fg"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border-subtle bg-bg-elevated animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            <div className="relative sm:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle pointer-events-none" />
              <input
                type="search"
                value={searchValue}
                onInput={(e) => setSearchValue(e.target.value)}
                placeholder="Search titles…"
                className="w-full h-10 pl-9 pr-3 rounded-md bg-surface-1 border border-border-subtle text-body text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>
            <div className="flex flex-col">
              {LINKS.map((link) => {
                const active = location === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-3 py-2.5 rounded-md text-body font-medium transition-colors',
                      active ? 'bg-surface-1 text-fg' : 'text-fg-muted hover:bg-surface-1 hover:text-fg'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  href="/movies/new"
                  className="px-3 py-2.5 rounded-md text-body font-medium text-brand-500 hover:bg-surface-1"
                >
                  + Add movie
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
