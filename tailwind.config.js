/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
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
    },
  },
  plugins: [],
};