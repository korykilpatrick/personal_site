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
        // Primary ink — navy, used for body text, navbar, anchors, primary chrome
        primary: {
          DEFAULT: '#15263f',
          dark: '#0c1727',
          light: '#274361',
        },
        // Kept for specific legacy uses (e.g. navbar social-link icon hover),
        // but the house palette now routes interactive accents through `oxblood`.
        secondary: {
          DEFAULT: '#3f7fd8',
          dark: '#2d63af',
          light: '#84b5ff',
        },
        // Paper — the site's warm ground. Cream-stock, not cool sky.
        cream: {
          DEFAULT: '#f4ecd8', // main page paper
          light: '#faf5ea',   // almost-white, warm
          deep: '#ebe0c6',    // slightly deeper paper (popover surface)
          deeper: '#e1d4b3',  // card edges, rules
        },
        // Warm neutral — walnut, the library's wood. Shelves already use this.
        // Promoted from shelf-only to systematic warm ink (dividers, meta, chip borders).
        walnut: {
          DEFAULT: '#4a3423',
          dark: '#2a1d10',
          mid: '#6b4f35',
          light: '#8b6f4f',
        },
        // Stamp accent — oxblood. Used sparingly (≤10%) for punctuation:
        // reading-now dot, active tab, the house dingbat, link hover.
        oxblood: {
          DEFAULT: '#9e3a2a',
          light: '#b54a37',
          dark: '#7a2b1e',
        },
        textPrimary: '#172331',  // navy ink on cream — unchanged, reads classic
        textSecondary: '#4a3d2a', // warm charcoal (walnut-ink) replacing cool slate
        textTertiary: '#7b6a50',  // warm muted — walnut.light territory
        background: '#f4ecd8',    // cream (was cool sky #edf2f8)
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
