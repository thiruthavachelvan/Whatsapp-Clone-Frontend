/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          light: '#dcf8c6',
          green: '#25D366',
          teal: '#128C7E',
          darkTeal: '#075E54',
          gray: '#ECE5DD',
          dark: '#111b21',
          darkGray: '#202c33',
          darkMessage: '#005c4b',
        }
      }
    },
  },
  plugins: [],
}
