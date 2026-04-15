module.exports = {
  content: [
    './frontend/src/**/*.{js,jsx,ts,tsx}',
    '!./frontend/src/**/*.test.{js,jsx,ts,tsx}',
    '!./frontend/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '!./frontend/src/pages/dormant/**/*.{js,jsx,ts,tsx}',
    '!./frontend/src/components/library/**/*.{js,jsx,ts,tsx}',
    '!./frontend/src/components/projects/**/*.{js,jsx,ts,tsx}',
    '!./frontend/src/components/work/**/*.{js,jsx,ts,tsx}',
    '!./frontend/src/components/home/{CurrentlyReading,ExploreGrid,HomepageLibraryItem,NavCard,SiteNote,WelcomeBlurb}.tsx',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#15263f',
          dark: '#0c1727',
          light: '#274361',
        },
        secondary: {
          DEFAULT: '#3f7fd8',
          dark: '#2d63af',
          light: '#84b5ff',
        },
        textPrimary: '#172331',
        textSecondary: '#4a5a6c',
        textTertiary: '#7d8b99',
        background: '#edf2f8',
        stone: {
          50: '#f7f9fb',
          100: '#edf2f7',
          200: '#dce5ef',
          500: '#7d8a99',
          700: '#475465',
          800: '#24313f',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Newsreader', 'IBM Plex Serif', 'ui-serif', 'Georgia'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
