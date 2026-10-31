/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        linear: {
          bg: '#111411',
          sidebar: '#191d19',
          surface: '#202520',
          panel: '#252b25',
          hover: '#2a3029',
          active: '#30372f',
          border: '#30372f',
          borderMuted: '#3c453a',
          text: '#e8ebe4',
          textSecondary: '#a5aea0',
          textMuted: '#818b7e',
          textFaint: '#667061',
          accent: '#a2aa83',
          accentHover: '#b2bc94',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        slate: {
          700: '#3c453a',
          750: '#30372f',
          800: '#252b25',
          850: '#202520',
          900: '#191d19',
          950: '#111411',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'modal': '0 16px 36px -4px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06)',
      }
    },
  },
  plugins: [],
}
