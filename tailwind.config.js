/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'var(--accent)',
          dim: 'var(--accent-dim)',
          border: 'var(--accent-border)',
          glow: 'var(--accent-dim)',
        },
        bg: {
          DEFAULT: 'var(--bg)',
          2: 'var(--bg-2)',
          3: 'var(--bg-3)',
          4: 'var(--bg-4)',
        },
        text: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-secondary)',
          dim: 'var(--text-dim)',
        },
        'btn-colored-text': 'var(--btn-colored-text)',
        'btn-normal-text': 'var(--btn-normal-text)',
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
        btn: '100px',
        tag: '6px',
        pill: '100px',
        input: '14px',
      },
      boxShadow: {
        accent: 'var(--shadow-accent)',
        'accent-lg': 'var(--shadow-accent)', // Or any variation
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      screens: {
        nav: '900px',
      },
    },
  },
  plugins: [],
}
