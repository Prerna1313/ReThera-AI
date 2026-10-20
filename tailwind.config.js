/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rethera: {
          bg: {
            dark: '#06111F',
            light: '#F4F7FA',
          },
          sidebar: {
            dark: '#071321',
            light: '#FFFFFF',
          },
          surface: {
            dark: '#0A1B2B',
            light: '#FFFFFF',
          },
          elevated: {
            dark: '#0D2233',
            light: '#F8FAFC',
          },
          text: {
            primary: {
              dark: '#E8F3F7',
              light: '#122435',
            },
            secondary: {
              dark: '#9BB0BF',
              light: '#586C7D',
            },
          },
          border: {
            dark: '#1C3648',
            light: '#DCE5EC',
          },
          teal: {
            DEFAULT: '#14D9B5',
            light: '#087F70',
            glow: 'rgba(20, 217, 181, 0.4)',
          },
          cyan: {
            DEFAULT: '#31C5F4',
            light: '#087FA5',
            glow: 'rgba(49, 197, 244, 0.4)',
          },
          indigo: {
            DEFAULT: '#7C73FF',
            light: '#6558D3',
          },
          success: '#2DD4A7',
          warning: '#F4BC58',
          danger: '#FB7185',
          neutral: '#8293A5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'teal-glow': '0 0 20px -2px rgba(20, 217, 181, 0.35)',
        'cyan-glow': '0 0 20px -2px rgba(49, 197, 244, 0.35)',
        'elevated-dark': '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px #1C3648',
        'elevated-light': '0 8px 30px rgba(0, 0, 0, 0.08), 0 0 0 1px #DCE5EC',
      },
    },
  },
  plugins: [],
}
