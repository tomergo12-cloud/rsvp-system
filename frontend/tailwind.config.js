/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-jost)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f5f4f0',
          100: '#e8e5dc',
          200: '#d1ccbf',
          300: '#b3ab98',
          400: '#928876',
          500: '#796d5e',
          600: '#63584c',
          700: '#504740',
          800: '#433c37',
          900: '#3a3430',
          950: '#1e1a17',
        },
        gold: {
          300: '#f0d48a',
          400: '#e8c55a',
          500: '#d4a931',
          600: '#b8891c',
          700: '#8f6510',
        },
        blush: {
          100: '#fdf0ed',
          200: '#f9d9d2',
          300: '#f2b8ae',
          400: '#e8907f',
          500: '#d96e5a',
        },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'confetti': 'confetti 1s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        confetti: {
          '0%': { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
          '60%': { transform: 'scale(1.1) rotate(3deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
