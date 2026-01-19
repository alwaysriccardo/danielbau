/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syncopate', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        bg: '#E3E1DC',
        dark: '#121212',
        accent: '#374336',
      },
    },
  },
  plugins: [],
}
