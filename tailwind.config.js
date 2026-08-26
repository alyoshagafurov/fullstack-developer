/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Luxury — warm near-black surfaces, warm off-white/taupe type, bronze accent
        bg: {
          DEFAULT: '#191817', // page — deep warm charcoal
          2: '#1F1E1C',       // alt band
        },
        card: {
          DEFAULT: '#242322', // cards (#242323)
          2: '#2C2B29',       // raised
        },
        ink: {
          DEFAULT: '#EBE7E1', // primary — warm off-white
          2: '#AEA7A3',       // secondary — warm taupe (#AEA7A3)
        },
        muted: '#857F79',
        line: 'rgba(174, 167, 163, 0.12)',
        'line-2': 'rgba(174, 167, 163, 0.22)',
        accent: {
          DEFAULT: '#B98A5E', // refined bronze
          deep: '#795238',    // palette brown
        },
        bone: '#EBE7E1',      // warm light — solid fills
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
