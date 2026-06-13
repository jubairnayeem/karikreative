/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'sans-serif'],
      },
      colors: {
        ink: '#0D0D0D',
        chalk: '#F7F5F0',
        mist: '#E8E4DC',
        kari: {
          DEFAULT: '#FF5C1A',
          light: '#FF7A40',
          dark: '#CC4200',
        },
        slate: '#6B6860',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
}
