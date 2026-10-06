/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: { 
        "outline": "#6d7a72", "surface-bright": "#f8f9ff", "on-surface": "#121c2a", "on-secondary": "#ffffff", "on-secondary-container": "#006f66", "inverse-surface": "#27313f", "tertiary-fixed": "#ffddb8", "on-primary-container": "#f5fff7", "primary-fixed-dim": "#68dba9", "secondary-container": "#86f2e4", "on-background": "#121c2a", "surface-container-low": "#eff4ff", "on-tertiary-fixed-variant": "#653e00", "tertiary-container": "#a36700", "surface-container-lowest": "#ffffff", "primary": "#006948", "surface-tint": "#006c4a", "tertiary": "#825100", "surface-container-high": "#dee9fc", "secondary-fixed": "#89f5e7", "surface-container": "#e6eeff", "on-error": "#ffffff", "primary-fixed": "#85f8c4", "secondary-fixed-dim": "#6bd8cb", "inverse-on-surface": "#eaf1ff", "surface-container-highest": "#d9e3f6", "on-tertiary": "#ffffff", "on-primary-fixed-variant": "#005137", "secondary": "#006a61", "error-container": "#ffdad6", "surface-variant": "#d9e3f6", "tertiary-fixed-dim": "#ffb95f", "on-tertiary-container": "#fffbff", "on-surface-variant": "#3d4a42", "outline-variant": "#bccac0", "background": "#f8f9ff", "surface": "#f8f9ff", "primary-container": "#00855d", "on-primary-fixed": "#002114", "on-primary": "#ffffff", "on-tertiary-fixed": "#2a1700", "on-error-container": "#93000a", "surface-dim": "#d0dbed", "on-secondary-fixed": "#00201d", "error": "#ba1a1a", "inverse-primary": "#68dba9", "on-secondary-fixed-variant": "#005049" 
      }, 
    },
  },
  plugins: [],
}
