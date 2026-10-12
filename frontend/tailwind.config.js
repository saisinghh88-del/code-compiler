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
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        editor: {
          bg: '#0d1117',
          surface: '#161b22',
          border: '#30363d',
          active: '#21262d',
          text: '#c9d1d9',
          muted: '#8b949e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(45, 212, 191, 0.25)',
        'glow-indigo': '0 0 20px -3px rgba(99, 102, 241, 0.25)',
      }
    },
  },
  plugins: [],
}
