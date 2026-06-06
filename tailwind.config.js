/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#070A11',
          2: '#0C1320',
        },
        surface: '#111B2E',
        ink: {
          DEFAULT: '#E9EDF5',
          2: '#A6B0C4',
        },
        muted: '#6E798F',
        accent: {
          DEFAULT: '#4F8AE0',
          deep: '#2E5BA8',
          soft: '#8FB6EE',
        },
        teal: {
          DEFAULT: '#38B6D8',
          soft: '#7FD3EC',
        },
        dark: {
          DEFAULT: '#04060C',
          2: '#0A0F1A',
        },
        line: 'rgba(150, 180, 230, 0.12)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
      maxWidth: {
        content: '1240px',
      },
    },
  },
  plugins: [],
};
