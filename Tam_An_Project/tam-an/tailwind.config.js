/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tea-green': '#3e654cff', // Màu xanh tươi
        'tea-dark': '#5cb680ff',  // Màu xanh rêu đậm (Logo/Footer)
        'earth-beige': '#f5f5f4', // Màu nền kem
        'earth-brown': '#78350f', // Màu nâu gỗ
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'], 
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}