/** @type {import('tailwindcss').Config} */

/*
 * aly — design tokens.
 *
 * Every value here points at a custom property declared in app/globals.css,
 * so `bg-surface` and `var(--surface)` can never disagree. Colours that take
 * an alpha (text-ink/50, stroke-copper/40) are declared through an RGB
 * triplet; the rest are plain references.
 *
 * Copper is the only colour in the system. `signal` and `line` remain as
 * aliases for the inner pages until they move to this world.
 */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: 'rgb(var(--base-rgb) / <alpha-value>)',
          deep: 'var(--base-deep)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-raised)',
          low: 'var(--surface)',
          high: 'var(--surface-raised)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink-rgb) / <alpha-value>)',
          bright: 'var(--ink-bright)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
        },
        copper: {
          DEFAULT: 'rgb(var(--copper-rgb) / <alpha-value>)',
          bright: 'var(--copper-bright)',
          deep: 'var(--copper-deep)',
          soft: 'rgb(var(--copper-rgb) / 0.55)',
        },
        led: 'rgb(var(--led-rgb) / <alpha-value>)',
        edge: {
          DEFAULT: 'var(--edge)',
          2: 'var(--edge-2)',
        },
        line: {
          DEFAULT: 'var(--edge)',
          2: 'var(--edge-2)',
        },
        signal: {
          DEFAULT: 'rgb(var(--copper-rgb) / <alpha-value>)',
          deep: 'var(--copper-deep)',
          wash: 'rgb(var(--copper-rgb) / 0.10)',
        },
        day: {
          DEFAULT: 'var(--day)',
          ink: 'rgb(var(--day-ink-rgb) / <alpha-value>)',
          2: 'var(--day-ink-2)',
          edge: 'var(--day-edge)',
        },
      },

      /* Straight lines. Panels 6px, controls 4px, chips 3px, nothing round.
         `pill` and `card` are kept as names so the inner pages still build. */
      borderRadius: {
        panel: 'var(--r-panel)',
        card: 'var(--r-control)',
        control: 'var(--r-control)',
        chip: 'var(--r-chip)',
        pill: 'var(--r-panel)',
      },

      fontFamily: {
        display: ['Unbounded', 'Onest', 'system-ui', 'sans-serif'],
        sans: ['Onest', 'system-ui', 'sans-serif'],
        mono: ['Onest', 'system-ui', 'sans-serif'],
      },

      /* Display sizes are modest on purpose: lettering on a wall, not a
         poster. The section heading is the same size everywhere; only the
         hero is allowed to be larger. */
      fontSize: {
        meta: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.16em' }],
        micro: ['0.8125rem', { lineHeight: '1.5' }],
        body: ['0.9375rem', { lineHeight: '1.65' }],
        lead: ['clamp(1.0625rem,0.95rem + 0.5vw,1.25rem)', { lineHeight: '1.55' }],
        'd-s': ['clamp(1.375rem,1.1rem + 1.1vw,1.9rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'd-m': ['clamp(1.6rem,1.15rem + 1.6vw,2.4rem)', { lineHeight: '1.12', letterSpacing: '-0.012em' }],
        'd-l': ['clamp(1.9rem,1.1rem + 2.6vw,3.3rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        'd-xl': ['clamp(2.4rem,1.4rem + 3.8vw,4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
      },

      maxWidth: {
        shell: '1440px',
        text: '68ch',
        narrow: '640px',
      },

      spacing: {
        gutter: 'clamp(1rem,4vw,3rem)',
        'rhythm-s': 'clamp(4rem,8vw,6.5rem)',
        'rhythm-m': 'clamp(5.5rem,10vw,8.5rem)',
        'rhythm-l': 'clamp(7rem,14vw,10.5rem)',
      },

      screens: { xs: '480px' },

      transitionTimingFunction: {
        out: 'cubic-bezier(.22,1,.36,1)',
      },
    },
  },
  plugins: [],
};
