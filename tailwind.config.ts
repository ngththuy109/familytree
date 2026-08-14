import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic tokens driven by CSS variables (see globals.css)
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        primary: 'var(--primary)',
        'primary-fg': 'var(--primary-fg)',
        accent: 'var(--accent)',
      },
      fontSize: {
        // Scale everything by --font-scale (elderly mode raises it)
        base: 'calc(1rem * var(--font-scale, 1))',
      },
    },
  },
  plugins: [],
};

export default config;
