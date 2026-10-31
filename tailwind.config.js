/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kid: {
          blue: '#2563EB',
          sky: '#38BDF8',
          green: '#10B981',
          emerald: '#059669',
          yellow: '#F59E0B',
          amber: '#D97706',
          purple: '#8B5CF6',
          pink: '#EC4899',
          orange: '#F97316',
          red: '#EF4444',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          darkBg: '#0F172A',
          darkCard: '#1E293B',
        }
      },
      fontFamily: {
        display: ['ui-rounded', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'kid': '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'kid-hover': '0 16px 32px -4px rgba(0, 0, 0, 0.12), 0 8px 16px -2px rgba(0, 0, 0, 0.06)',
        'kid-button': '0 4px 0px 0px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
