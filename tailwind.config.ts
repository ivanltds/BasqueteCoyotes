import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'b-orange': '#FF5722',
        'b-dark':   '#0D0D0D',
        'b-gray':   '#1E1E1E',
        'b-stone':  '#2A2A2A',
        'b-neon':   '#E0FF00',
        'b-cream':  '#F5F0E8',
      },
      fontFamily: {
        'display': ['"Bebas Neue"', 'Impact', 'sans-serif'],
        'body':    ['"DM Sans"', 'Helvetica', 'sans-serif'],
        'mono':    ['"DM Mono"', 'monospace'],
      },
      backgroundImage: {
        'asphalt': "url('/images/textures/asphalt.png')",
        'noise':   "url('/images/textures/noise.svg')",
      },
      animation: {
        'flicker':   'flicker 3s infinite',
        'slide-up':  'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'marquee':   'marquee 20s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%':      { opacity: '1' },
          '93%':      { opacity: '0.4' },
          '94%':      { opacity: '1' },
          '96%':      { opacity: '0.6' },
          '97%':      { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'neon-orange': '0 0 20px rgba(255, 87, 34, 0.6)',
        'neon-yellow': '0 0 20px rgba(224, 255, 0, 0.6)',
        'brutal':      '6px 6px 0px #E0FF00',
        'brutal-org':  '6px 6px 0px #FF5722',
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
}
export default config
