import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './composables/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      borderRadius: {
        sm: '0.125rem',
      },
    },
  },
  plugins: [],
}

export default config
