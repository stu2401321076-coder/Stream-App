/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0a0a0b', elevated: '#141416', overlay: '#1c1c20' },
        surface: { 1: '#18181b', 2: '#27272a', 3: '#3f3f46' },
        border: { subtle: '#27272a', DEFAULT: '#3f3f46', strong: '#52525b' },
        fg: { DEFAULT: '#fafafa', muted: '#a1a1aa', subtle: '#71717a', faint: '#52525b' },
        brand: { 50: '#fef2f2', 500: '#e50914', 600: '#c2080f', 700: '#9a0610' },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        heading: ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        subheading: ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        body: ['0.9375rem', { lineHeight: '1.55' }],
        caption: ['0.8125rem', { lineHeight: '1.4' }],
        micro: ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.04em' }],
      },
      borderRadius: { sm: '4px', DEFAULT: '8px', lg: '12px', xl: '16px', '2xl': '24px' },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4)',
        pop: '0 8px 24px rgba(0,0,0,0.5)',
        hero: '0 20px 60px rgba(0,0,0,0.7)',
        glow: '0 0 0 1px rgba(229,9,20,0.4), 0 8px 24px rgba(229,9,20,0.25)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      aspectRatio: {
        poster: '2 / 3',
        backdrop: '16 / 9',
        card: '4 / 5',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
