/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,svelte}'],
  theme: {
    extend: {
      colors: {
        surface: '#0b1120',
        'surface-muted': '#111a2c',
        accent: '#f97316',
        win: '#4ade80',
        tie: '#facc15',
        loss: '#f87171',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        hud: '0 15px 35px rgba(15, 23, 42, 0.4)',
      },
    },
  },
  plugins: [],
}

