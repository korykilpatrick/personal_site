/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#0e7490', // teal-700
        secondary: '#7c3aed', // violet-600
        background: '#f8fafc', // slate-50
        textPrimary: '#1e293b', // slate-800
        textSecondary: '#64748b', // slate-500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};