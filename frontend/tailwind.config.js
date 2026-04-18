/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "tertiary-fixed": "#ffdea5",
        "on-tertiary": "#ffffff",
        "surface-container-low": "#f4f3f2",
        "on-primary-fixed-variant": "#3b4856",
        "surface-bright": "#faf9f8",
        "secondary-container": "#cbe3f7",
        "on-error-container": "#93000a",
        "inverse-on-surface": "#f1f0f0",
        "primary-fixed": "#d6e4f6",
        "surface-variant": "#e3e2e1",
        "on-primary-fixed": "#0f1d29",
        "outline-variant": "#c4c6cc",
        "error": "#ba1a1a",
        "surface-tint": "#53606f",
        "primary-fixed-dim": "#bac8d9",
        "on-tertiary-container": "#a3813d",
        "tertiary": "#090500",
        "inverse-surface": "#2f3130",
        "outline": "#74777c",
        "primary": "#00050d",
        "error-container": "#ffdad6",
        "on-secondary-fixed": "#051e2c",
        "secondary-fixed": "#cee5f9",
        "surface-container-high": "#e9e8e7",
        "on-error": "#ffffff",
        "surface-container-highest": "#e3e2e1",
        "surface-container-lowest": "#ffffff",
        "on-background": "#1a1c1c",
        "on-primary-container": "#7a8797",
        "tertiary-container": "#2a1c00",
        "on-primary": "#ffffff",
        "on-secondary-container": "#4f6576",
        "primary-container": "#121f2c",
        "surface-container": "#eeeeed",
        "surface-dim": "#dadad9",
        "on-tertiary-fixed": "#261900",
        "on-tertiary-fixed-variant": "#5d4201",
        "secondary-fixed-dim": "#b2c9dd",
        "inverse-primary": "#bac8d9",
        "tertiary-fixed-dim": "#e9c176",
        "on-secondary": "#ffffff",
        "background": "#faf9f8",
        "surface": "#faf9f8",
        "on-surface-variant": "#44474c",
        "on-surface": "#1a1c1c",
        "secondary": "#4b6172",
        "on-secondary-fixed-variant": "#334959"
      },
      fontFamily: {
        "sans": ['Inter', 'sans-serif'], // Keep existing
        "heading": ['Poppins', 'sans-serif'], // Keep existing
        "headline": ["Noto Serif", "serif"],
        "body": ["Manrope", "sans-serif"],
        "label": ["Manrope", "sans-serif"]
      }
    },
  },
  plugins: [],
}