/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        drive: {
          blue: '#1a73e8',
          blueHover: '#1765cc',
          blueTint: '#e8f0fe',
          green: '#188038',
          yellow: '#f9ab00',
          red: '#d93025',
        },
        surface: {
          DEFAULT: '#ffffff',
          alt: '#f8f9fa',
          hover: '#f1f3f4',
          border: '#dadce0',
        },
        ink: {
          900: '#202124',
          700: '#3c4043',
          500: '#5f6368',
          400: '#80868b',
        },
      },
      fontFamily: {
        sans: ['"Roboto"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        drive: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        driveHover: '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
      },
    },
  },
  plugins: [],
}
