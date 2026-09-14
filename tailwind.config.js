/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'surface-subtle': '#f8f9fb',
        'surface-card': '#ffffff',
        'border-light': '#eaedf1',
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -1px rgba(0, 0, 0, 0.04), 0 1px 4px -1px rgba(0, 0, 0, 0.02)',
        'soft': '0 8px 30px -4px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'soft-lg': '0 20px 40px -10px rgba(0, 0, 0, 0.07), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'float': '0 12px 32px -4px rgba(0, 0, 0, 0.08)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
