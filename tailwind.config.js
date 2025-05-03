module.exports = {
  content: ['./frontend/src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // New color scheme: deep navy primary with warm amber accents
        primary: {
          DEFAULT: '#1a365d', // Deep navy blue
          dark: '#0f2942',    // Darker navy for hover states
          light: '#2c4a7c',   // Lighter navy for subtle elements
        },
        secondary: {
          DEFAULT: '#d97706', // Warm amber
          dark: '#b45309',    // Darker amber for hover states
          light: '#fbbf24',   // Lighter amber/gold for accents
        },
        // Text colors
        textPrimary: '#1f2937',   // Dark gray for primary text
        textSecondary: '#4b5563', // Medium gray for secondary text
        textTertiary: '#9ca3af',  // Light gray for tertiary text
        // Background colors
        background: '#f8fafc',    // Very light blue-gray
        // Keep the stone colors for certain elements
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          500: '#78716c',
          700: '#44403c',
          800: '#292524',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui'],
        serif: ['Merriweather', 'ui-serif', 'Georgia'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};