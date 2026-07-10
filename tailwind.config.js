/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#070707',
          2: '#0A0A0A',
        },
        card: {
          DEFAULT: '#101010',
          2: '#161616',
        },
        ink: {
          DEFAULT: '#F4F4F5', // primary text
          2: '#A1A1AA',       // secondary text
        },
        muted: '#6B6B72',
        line: 'rgba(255, 255, 255, 0.08)',
        'line-2': 'rgba(255, 255, 255, 0.14)',
        accent: '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
        wide: '1400px',
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
};
