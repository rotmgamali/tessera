/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bb: {
          deep:             'var(--bb-bg-deep)',
          surface:          'var(--bb-bg-surface)',
          elevated:         'var(--bb-bg-elevated)',
          overlay:          'var(--bb-bg-overlay)',
          // Backward-compatible aliases: the app also uses `bg-bb-bg-deep` /
          // `bg-bb-bg-elevated` (keys `bb.bg-deep` / `bb.bg-elevated`), which
          // previously didn't exist → those elements rendered with no bg.
          'bg-deep':         'var(--bb-bg-deep)',
          'bg-elevated':     'var(--bb-bg-elevated)',

          'text-primary':   'var(--bb-text-primary)',
          'text-secondary': 'var(--bb-text-secondary)',
          'text-muted':     'var(--bb-text-muted)',

          gold:             'var(--bb-gold)',
          'gold-light':     'var(--bb-gold-light)',
          'gold-dim':       'var(--bb-gold-dim)',
          'gold-glow':      'var(--bb-gold-glow)',
          'gold-glow-bg':   'var(--bb-gold-glow-bg)',

          success:          'var(--bb-success)',
          'success-dim':    'var(--bb-success-dim)',
          'success-bg':     'var(--bb-success-bg)',
          danger:           'var(--bb-danger)',
          'danger-dim':     'var(--bb-danger-dim)',
          'danger-glow':    'var(--bb-danger-glow)',
          warning:          'var(--bb-warning)',
          'warning-dim':    'var(--bb-warning-dim)',
          'warning-bg':     'var(--bb-warning-bg)',
          info:             'var(--bb-info)',
          'info-dim':       'var(--bb-info-dim)',

          // ws/chat-polish (2026-07-20, THEME G) — safety aliases for
          // color keys the Boardroom already referenced but that were
          // never defined, so they rendered transparent/unfinished:
          //   `bg-bb-warning-bg` / `bg-bb-success-bg` / `bg-bb-error-bg`
          //   `text-bb-error` / `border-bb-error` (alias of danger)
          //   `text-bb-text` (alias of primary), `bg-bb-bg` (deep surface)
          error:            'var(--bb-danger)',
          'error-bg':       'var(--bb-error-bg)',
          text:             'var(--bb-text-primary)',
          bg:               'var(--bb-bg-deep)',

          emerald:          'var(--bb-emerald)',
          'emerald-glow':   'var(--bb-emerald-glow)',
          blue:             'var(--bb-blue)',
          'blue-glow':      'var(--bb-blue-glow)',
          amber:            'var(--bb-amber)',
          'amber-glow':     'var(--bb-amber-glow)',
          purple:           'var(--bb-purple)',
          'purple-glow':    'var(--bb-purple-glow)',

          border:           'var(--bb-border)',
          'border-gold':    'var(--bb-border-gold)',
          'border-emerald': 'var(--bb-border-emerald)',
          'border-blue':    'var(--bb-border-blue)',
          'border-amber':   'var(--bb-border-amber)',

          panel:            'var(--bb-bg-panel)',
          primary:          'var(--bb-text-primary)',
          secondary:        'var(--bb-text-secondary)',
          tertiary:         'var(--bb-text-muted)',
          'gold-subtle':    'var(--bb-gold-dim)',
          'border-subtle':  'var(--bb-border)',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'bb-title':   ['1.25rem',  { lineHeight: '1.4', fontWeight: '600', letterSpacing: '-0.02em' }],
        'bb-section': ['0.75rem',  { lineHeight: '1', fontWeight: '500', letterSpacing: '0.08em' }],
        'bb-body':    ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'bb-caption': ['0.75rem',  { lineHeight: '1.4', fontWeight: '400' }],
        'bb-stat':    ['1.5rem',   { lineHeight: '1', fontWeight: '600' }],
        'bb-hero':    ['1.5rem',   { lineHeight: '1.3', fontWeight: '600' }],
        'bb-heading': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'bb-micro':   ['0.625rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};
