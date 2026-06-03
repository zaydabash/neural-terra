/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neural-blue': '#38bdf8',
        'neural-cyan': '#22d3ee',
        'neural-purple': '#8b5cf6',
        'neural-green': '#34d399',
        'neural-orange': '#fb923c',
        'neural-red': '#f87171',
        // Surface ramp (deep space -> frosted glass)
        ink: {
          950: '#05070d',
          900: '#0a0e17',
          800: '#0f1521',
          700: '#161d2c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.22em',
      },
      boxShadow: {
        glass: '0 8px 40px -8px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.06)',
        'glow-blue': '0 0 24px -4px rgba(56,189,248,0.55)',
        'glow-red': '0 0 24px -4px rgba(248,113,113,0.5)',
      },
      backgroundImage: {
        'glass-sheen':
          'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 40%, rgba(255,255,255,0) 100%)',
        'vignette':
          'radial-gradient(120% 90% at 50% 0%, rgba(56,189,248,0.10), rgba(5,7,13,0) 55%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2s ease-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 2.2s linear infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
