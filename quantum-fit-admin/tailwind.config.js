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
          50: '#e6ffff',
          100: '#b3ffff',
          200: '#80ffff',
          300: '#4dffff',
          400: '#1affff',
          500: '#00F0FF', // Azul eléctrico neón - Color principal
          600: '#00C8D4',
          700: '#00A0A8',
          800: '#007880',
          900: '#005058',
        },
        secondary: {
          50: '#f0fff0',
          100: '#ccffcc',
          200: '#99ff99',
          300: '#66ff66',
          400: '#33ff33',
          500: '#39FF14', // Verde neón - Color secundario
          600: '#2ECC71',
          700: '#27A85F',
          800: '#1F844D',
          900: '#18603B',
        },
        dark: {
          50: '#2A2A2A',
          100: '#252525',
          200: '#1A1A1A', // Gris oscuro para tarjetas
          300: '#151515',
          400: '#121212', // Negro suave
          500: '#0F0F0F',
          600: '#0C0C0C',
          700: '#0A0A0A', // Negro profundo - Fondo principal
          800: '#080808',
          900: '#050505',
        },
        border: {
          DEFAULT: '#2A2A2A',
          light: '#3A3A3A',
        }
      },
    },
  },
  plugins: [],
}
