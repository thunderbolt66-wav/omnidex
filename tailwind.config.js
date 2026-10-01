/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Garamond', 'Baskerville', '"Times New Roman"', 'serif'],
        playfair: ['"Playfair Display"', 'Didot', '"Bodoni MT"', 'Georgia', 'serif'],
        crimson: ['"Crimson Pro"', '"Crimson Text"', 'Georgia', '"Times New Roman"', 'serif'],
        lora: ['Lora', 'Georgia', '"Palatino Linotype"', 'Palatino', 'serif'],
        spectral: ['Spectral', 'Georgia', '"Times New Roman"', 'serif'],
        cinzel: ['Cinzel', '"Palatino Linotype"', '"Book Antiqua"', 'Georgia', 'serif'],
        outfit: ['Outfit', '"Century Gothic"', '"Trebuchet MS"', 'system-ui', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        space: ['"Space Grotesk"', '"Courier New"', 'monospace', 'sans-serif'],
        fira: ['"Fira Code"', '"Cascadia Code"', 'Consolas', '"Courier New"', 'monospace'],
      },
      colors: {
        sepia: {
          bg: '#F4ECD8',
          text: '#433422',
          paper: '#EAE0C8',
        },
        cyberpunk: {
          bg: '#080c14',
          card: '#0e1726',
          text: '#e2e8f0',
          accent: '#00f2fe',
          glow: '#ec4899',
        },
        forest: {
          bg: '#0a1310',
          card: '#101f1a',
          text: '#ecfdf5',
          accent: '#10b981',
          paper: '#152923',
        },
        nordic: {
          bg: '#0b1120',
          card: '#131f37',
          text: '#f0f9ff',
          accent: '#38bdf8',
          paper: '#1a2947',
        },
        sunset: {
          bg: '#140d1a',
          card: '#201529',
          text: '#fdf2f8',
          accent: '#f43f5e',
          paper: '#2b1b36',
        },
      },
    },
  },
  plugins: [],
}
