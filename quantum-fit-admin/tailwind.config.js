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
          50: '#ffffff',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#FFFFFF',
          600: '#d4d4d4',
          700: '#a3a3a3',
          800: '#737373',
          900: '#525252',
        },
        secondary: {
          50: '#ffffff',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#FFFFFF',
          600: '#d4d4d4',
          700: '#a3a3a3',
          800: '#737373',
          900: '#525252',
        },
        dark: {
          50: '#2A2A2A',
          100: '#222222',
          200: '#1A1A1A',
          300: '#151515',
          400: '#121212',
          500: '#0F0F0F',
          600: '#0C0C0C',
          700: '#0A0A0A',
          800: '#080808',
          900: '#050505',
        },
        border: {
          DEFAULT: '#333333',
          light: '#444444',
        }
      },
    },
  },
  plugins: [],
}
