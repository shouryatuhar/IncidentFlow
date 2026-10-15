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
          bg: '#08090a',
          sidebar: '#0d0e11',
          surface: '#111215',
          panel: '#15161a',
          hover: '#18191e',
          active: '#1f2026',
          border: '#1f2127',
          borderMuted: '#2a2c34',
          text: '#f4f4f5',
          textSecondary: '#a1a1aa',
          textMuted: '#71717a',
          textFaint: '#52525b',
          accent: '#5e6ad2',
          accentHover: '#6875e5',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        slate: {
          700: '#26282f',
          750: '#1f2127',
          800: '#1b1c20',
          850: '#15161a',
          900: '#0d0e11',
          950: '#08090a',
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
