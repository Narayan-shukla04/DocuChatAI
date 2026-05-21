/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B1120',
          card: '#111827',
          border: '#1F2937'
        },
        primary: {
          DEFAULT: '#7C3AED',
          hover: '#6D28D9'
        },
        secondary: {
          DEFAULT: '#06B6D4',
          hover: '#0891B2'
        },
        accent: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED'
        },
        text: {
          main: '#E2E8F0',
          muted: '#9CA3AF'
        }
      }
    },
  },
  plugins: [],
}
