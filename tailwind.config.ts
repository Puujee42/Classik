import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#FCEEF2', // Pastel pink
          100: '#FADEE5',
          200: '#F5BDCB',
          300: '#F09CB1',
          400: '#E87D9A',
          500: '#E06B8B', // Rose Pink
          600: '#C55B7A', // Darker Rose
          700: '#AA4B69',
          800: '#8F3B58',
          900: '#742B47',
        },
        amber: {
          50: '#FBF8F0',
          100: '#F7F1E1',
          200: '#EFE3C3',
          300: '#E7D5A5',
          400: '#DFC787',
          500: '#D4AF37', // Soft Gold
          600: '#C5A059', // Darker Gold
          700: '#AB8B4A',
          800: '#91763B',
          900: '#77612C',
        },
        soyol: {
          light: '#FCEEF2',
          DEFAULT: '#E06B8B',
          dark: '#C55B7A',
        },
        gold: {
          light: '#F7F1E1',
          DEFAULT: '#D4AF37',
          dark: '#C5A059',
        },
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Cinzel', 'serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "aurora": "aurora 60s linear infinite",
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          "50%": { backgroundPosition: "100% 50%, 100% 50%, 100% 50%" },
          "100%": { backgroundPosition: "350% 50%, 350% 50%, 350% 50%" },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // Scrollbar hide utility
    function ({ addUtilities }: any) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
};

export default config;
