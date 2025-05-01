/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./public/**/*.html",
      "./src/**/*.{js,html}"
    ],
    theme: {
      extend: {
        colors: {
          'furia-blue': '#0066FF',
          'furia-dark-blue': '#0047B3',
          'furia-light-blue': '#4D94FF',
          'furia-black': '#0A0A0A',
          'furia-dark-gray': '#1A1A1A',
          'furia-gray': '#2D2D2D'
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          display: ['Montserrat', 'system-ui', 'sans-serif']
        },
        spacing: {
          '72': '18rem',
          '84': '21rem',
          '96': '24rem',
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '2rem',
        },
        boxShadow: {
          'furia': '0 4px 20px rgba(0, 102, 255, 0.2)',
          'furia-lg': '0 10px 30px rgba(0, 102, 255, 0.3)'
        },
        animation: {
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'bounce-slow': 'bounce 2s infinite'
        },
        screens: {
          'xs': '480px'
        }
      }
    },
    plugins: [],
    darkMode: 'class',
  }