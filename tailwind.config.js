/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0918',
        bgsoft: '#17143D',
        surface: '#1B1840',
        surface2: '#221D52',
        accent: '#FFC168',
        accent2: '#FF7A3D',
        violet: '#8B5CF6',
        violetdeep: '#5B32C4',
        violetlight: '#B69CFF',
        muted: '#9092C4',
        success: '#4ADE80',
        warning: '#FBBF24',
        danger: '#F87171',
      },
      fontFamily: {
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2rem',
        card: '1.5rem',
        btn: '1rem',
        pill: '999px',
      },
      boxShadow: {
        'soft-sm': '0 2px 8px rgba(0,0,0,0.25)',
        'soft-md': '0 8px 24px rgba(0,0,0,0.35)',
        'soft-lg': '0 20px 50px rgba(0,0,0,0.45)',
        deep: '0 30px 70px -15px rgba(0,0,0,0.6)',
        'glow-gold': '0 0 25px rgba(255,193,104,0.35)',
        'glow-violet': '0 0 25px rgba(139,92,246,0.35)',
        'neumo-out': '8px 8px 20px rgba(0,0,0,0.45), -8px -8px 20px rgba(255,255,255,0.03)',
        'neumo-in': 'inset 6px 6px 14px rgba(0,0,0,0.45), inset -6px -6px 14px rgba(255,255,255,0.03)',
        glass: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'smooth-3d': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        float: 'floaty 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
        }
