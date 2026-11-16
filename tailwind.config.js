/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dabha: {
          dark: "#1C0F0A",
          brown: {
            DEFAULT: "#2A1810",
            light: "#3D2314",
            border: "#4E2E1B",
            muted: "#7A5034"
          },
          gold: {
            DEFAULT: "#D97706",
            light: "#F59E0B",
            bright: "#FBBF24",
            dark: "#B45309"
          },
          cream: {
            DEFAULT: "#FDFAF5",
            card: "#FFFDF9",
            soft: "#F7F2E8",
            border: "#E9DFCE"
          },
          green: {
            DEFAULT: "#15803D",
            light: "#22C55E",
            dark: "#166534",
            bg: "#F0FDF4"
          },
          red: {
            DEFAULT: "#DC2626",
            light: "#EF4444",
            dark: "#991B1B",
            bg: "#FEF2F2"
          }
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Kannada"', 'system-ui', 'sans-serif'],
        kannada: ['"Noto Sans Kannada"', 'sans-serif'],
        serif: ['"Cinzel"', 'Georgia', 'serif']
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(42, 24, 16, 0.08), 0 2px 6px -1px rgba(42, 24, 16, 0.04)',
        'warm-lg': '0 10px 25px -3px rgba(42, 24, 16, 0.12), 0 4px 10px -2px rgba(42, 24, 16, 0.06)',
        'gold-glow': '0 0 25px rgba(217, 119, 6, 0.25)',
      }
    },
  },
  plugins: [],
}
