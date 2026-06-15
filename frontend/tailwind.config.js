/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0563c5',
          dark: '#034fa3',
        },
        surface: '#f8fafc',
      },
    },
  },
  plugins: [],
}
