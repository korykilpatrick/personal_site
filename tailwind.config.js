/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./frontend/src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // blue-500 - warm blue
        secondary: '#1d4ed8', // blue-700 - deeper blue accent
        background: '#f0f9ff', // sky-50 - soft blue background
        textPrimary: '#334155', // slate-700 - softer than black
        textSecondary: '#64748b', // slate-500 - muted text
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Merriweather"', 'Georgia', 'serif'],
      },
      fontSize: {
        // Example adjustments - refine as needed
        'xs': '.75rem',    // 12px
        'sm': '.875rem',   // 14px
        'base': '0.9375rem',    // 15px - Reduced from 1rem
        'lg': '1.125rem',  // 18px
        'xl': '1.25rem',   // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '1.75rem',  // 28px - Reduced from 1.875rem
        '4xl': '2rem',     // 32px - Reduced from 2.25rem
        '5xl': '2.5rem',   // 40px - Reduced from 3rem
        '6xl': '3rem',     // 48px - Reduced from 3.75rem
        '7xl': '3.5rem',   // 56px - Reduced from 4.5rem
      }
    },
  },
  plugins: [],
};