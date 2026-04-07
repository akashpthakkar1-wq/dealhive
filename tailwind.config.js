/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdf4fd',
          100: '#f7e5f7',
          200: '#edc8ed',
          300: '#de9ede',
          400: '#c86ac8',
          500: '#822a7f',
          600: '#6e2369',
          700: '#5a1c55',
          800: '#481543',
          900: '#3a1137',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
