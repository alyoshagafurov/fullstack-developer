/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          0: '#050505',
          1: '#0D0D0D',
          2: '#101820',
          3: '#171F2A',
        },
        neon: {
          blue: '#00FFFF',
          purple: '#8A2BE2',
          yellow: '#D4AF37', // aliased to luxury gold so existing utilities go premium
        },
        gold: {
          DEFAULT: '#D4AF37',
          soft: '#C9A961',
          bright: '#F5D06A',
        },
        muted: '#8A8A8A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
