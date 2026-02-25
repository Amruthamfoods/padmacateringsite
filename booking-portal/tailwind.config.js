/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B0000',
          light: '#A50000',
          dark: '#6B0000',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E5C84D',
          dark: '#B8922E',
        },
        cream: '#FBF8F0',
      },
    },
  },
  plugins: [],
}
