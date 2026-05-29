/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        beanie: {
          blue: '#3b6dc9',
          white: '#f8fafc',
          red: '#dc2626',
          green: '#16a34a',
          yellow: '#fbbf24',
        },
      },
    },
  },
  plugins: [],
}
