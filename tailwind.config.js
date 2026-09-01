/** @type {import('tailwindcss').Config} */

/*
 * ALY — design tokens.
 *
 * Four colours, three type families, one fluid scale. Everything the site is
 * allowed to look like is declared here; components pick from this and never
 * invent a hex value.
 *
 * The signal colour (#00ADB5) is intentionally the only saturated value in the
 * system, so any place it appears reads as "this does something".
 */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Canvas — matte black. Not pure #000: a hair of warmth keeps it
           reading as a matte material rather than a switched-off screen. */
        base: {
          DEFAULT: '#0C0D0F',
          deep: '#070809', // the floor — footer, overlays, deepest areas
        },
        /* Raised surfaces. The palette greys live here now, as material
           against the black rather than as the canvas itself. */
        surface: {
          DEFAULT: '#222831',
          low: '#15181C', // barely lifted off the black
          high: '#393E46', // panels, frames, graphic blocks
        },
        /* Light — primary text, and inverted blocks.
           These match the CSS custom properties in globals.css exactly. They
           used to differ by a few points of alpha, which meant `text-ink-3`
           and `color: var(--ink-3)` were two different greys depending on
           which system a component happened to use. */
        ink: {
          DEFAULT: '#EEEEEE',
          2: 'rgba(238,238,238,0.66)', // secondary text
          3: 'rgba(238,238,238,0.50)', // meta, disabled — 4.6:1 on --base
        },
        /* The one signal colour. Small doses only. */
        signal: {
          DEFAULT: '#00ADB5',
          deep: '#00868D', // pressed / hover on filled
          wash: 'rgba(0,173,181,0.12)', // faint backing
        },
        line: {
          DEFAULT: 'rgba(238,238,238,0.12)',
          2: 'rgba(238,238,238,0.24)',
        },
      },

      /* Two families only, both self-hosted from public/fonts. `mono` is
         intentionally mapped to Onest: the technical voice comes from wide
         tracking on micro labels, not from a third typeface. */
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Onest', 'system-ui', 'sans-serif'],
        mono: ['Onest', 'system-ui', 'sans-serif'],
      },

      /* Fluid scale — headings are compositional elements, so they move with
         the viewport rather than stepping at breakpoints. */
      fontSize: {
        meta: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.16em' }],
        micro: ['0.8125rem', { lineHeight: '1.5' }],
        body: ['0.9375rem', { lineHeight: '1.65' }],
        lead: ['clamp(1.0625rem,0.9rem + 0.7vw,1.375rem)', { lineHeight: '1.55' }],
        'd-s': ['clamp(1.5rem,1.2rem + 1.4vw,2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'd-m': ['clamp(2rem,1.5rem + 2.6vw,3.5rem)', { lineHeight: '1.06', letterSpacing: '-0.03em' }],
        'd-l': ['clamp(2.75rem,1.8rem + 4.6vw,5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.035em' }],
        'd-xl': ['clamp(3.25rem,1.5rem + 8.4vw,9rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
      },

      maxWidth: {
        shell: '1440px', // outer grid
        text: '68ch',    // long-form measure
        narrow: '640px',
      },

      spacing: {
        gutter: 'clamp(1.25rem,4vw,2.5rem)',
        /* Section rhythm is deliberately uneven — see globals.css */
        'rhythm-s': 'clamp(4rem,8vw,7rem)',
        'rhythm-m': 'clamp(6rem,12vw,11rem)',
        'rhythm-l': 'clamp(8rem,18vw,16rem)',
      },

      screens: { xs: '480px' },

      transitionTimingFunction: {
        out: 'cubic-bezier(.22,1,.36,1)',
      },
    },
  },
  plugins: [],
};
