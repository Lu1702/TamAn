/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tea-green': '#3e654cff', 
        'tea-dark': '#23603bff', 
        'earth-beige': '#f5f5f4',
        'earth-brown': '#78350f',
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'], 
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}