import type { Config } from 'tailwindcss'

export default {
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0b0b0c',
          800: '#111114',
          700: '#191a1e',
        },
        gold: {
          400: '#d4af37',
          300: '#e4c75a',
        }
      }
    }
  },
  plugins: []
} satisfies Config

