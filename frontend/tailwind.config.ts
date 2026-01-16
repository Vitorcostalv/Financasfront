import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0B0F1A',
          panel: '#121826',
          panelAlt: '#141B2D',
          border: '#1F2A40',
          muted: '#94A3B8',
          accent: '#00D1B2',
          accentSoft: '#0B2E2A',
          danger: '#F97316',
          success: '#10B981',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0, 209, 178, 0.2), 0 12px 40px rgba(0, 0, 0, 0.35)',
      },
      backgroundImage: {
        'app-gradient': 'radial-gradient(circle at top, rgba(0, 209, 178, 0.15), transparent 45%), radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.12), transparent 50%)',
      },
    },
  },
  plugins: [],
};

export default config;
