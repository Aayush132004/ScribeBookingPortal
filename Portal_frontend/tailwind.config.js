/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High-contrast primary colors for accessibility
        primary: {
          light: '#3b82f6',
          DEFAULT: '#1d4ed8', // Accessible blue contrast ratio
          dark: '#1e3a8a',
        },
        background: '#ffffff',
        surface: '#f9fafb',
      },
    },
  },
  plugins: [],
}