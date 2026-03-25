/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    { pattern: /^(bg|text|border|border-l|from|to|ring)-(primary|blue)-(50|100|200|300|400|500|600|700|800|900)/ },
    'bg-primary-50', 'bg-primary-100', 'bg-primary-400', 'bg-primary-500', 'bg-primary-600',
    'text-primary-100', 'text-primary-200', 'text-primary-500', 'text-primary-600', 'text-primary-700',
    'border-primary-100', 'border-l-primary-500',
    'from-primary-500', 'to-primary-600',
    'hover:bg-primary-50', 'hover:bg-primary-600',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f0faf4',
          100: '#dcf3e6',
          200: '#bae8ce',
          300: '#86d5a8',
          400: '#4dba7d',
          500: '#2E8B57',
          600: '#247548',
          700: '#1d5e39',
          800: '#184d2f',
          900: '#143f27',
        },
        blue: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          400: '#60a5fa',
          500: '#2C7BE5',
          600: '#2563da',
          700: '#1d4ed8',
        },
        accent: {
          yellow: '#FFD166',
          orange: '#F77F00',
        },
        danger:  '#DC3545',
        success: '#28A745',
        warning: '#FFC107',
        info:    '#17A2B8',
      },
      borderRadius: {
        DEFAULT: '8px', md: '10px', lg: '12px', xl: '16px', '2xl': '20px',
      },
      boxShadow: {
        soft:  '0 2px 12px 0 rgba(0,0,0,0.08)',
        card:  '0 4px 24px 0 rgba(46,139,87,0.10)',
      },
      animation: {
        'fade-in':    'fadeIn 0.35s ease-out',
        'slide-up':   'slideUp 0.35s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0', transform: 'translateY(6px)' },   '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(16px)' },  '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-8px)' },  '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
}
