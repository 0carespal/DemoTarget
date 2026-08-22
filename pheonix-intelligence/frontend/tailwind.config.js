/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#e5e5e5',
        surface: {
          DEFAULT: '#121212',
          hover: '#1a1a1a',
          active: '#242424',
          border: '#262626',
          subtle: '#141414'
        },
        accent: {
          DEFAULT: '#22c55e',
          dim: '#15803d',
          dark: '#14532d',
          light: '#4ade80'
        }
      },
      fontFamily: {
        sans: ['JetBrains Mono', 'Menlo', 'Consolas', 'Courier New', 'monospace'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        none: 'none',
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '0px',
      }
    },
  },
  plugins: [],
}
