import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Caribbean-Modernist Civic palette (locked from brand-card.html)
        navy: {
          DEFAULT: '#0B2A4A',
          dark: '#061A2F',
          50: '#EEF2F7',
          100: '#D4DEEA',
          900: '#0B2A4A',
        },
        crimson: {
          DEFAULT: '#C8102E',
          dark: '#8A0A1F',
        },
        saffron: {
          DEFAULT: '#E8A04C',
          soft: '#F4C58A',
        },
        palm: '#3F7D5C',
        cream: '#F5EFE3',
        parchment: '#FAF6EE',
        ink: '#1A1A1A',
        stone: '#E5E7EB',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        accent: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        eyebrow: ['Jost', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.22em',
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-up': 'fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) both',
        'marquee-left': 'marqueeLeft 60s linear infinite',
        'marquee-right': 'marqueeRight 80s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marqueeLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeRight: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
