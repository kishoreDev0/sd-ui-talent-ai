module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F39F6',
          50: '#F0EDFF',
          100: '#E0DBFF',
          200: '#C2B7FF',
          300: '#A393FF',
          400: '#856FFF',
          500: '#4F39F6',
          600: '#3D2DC4',
          700: '#2E2293',
          800: '#1F1762',
          900: '#100B31',
        },
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        spin: 'spin 1s linear infinite',
        'spin-fast': 'spin 0.5s linear infinite',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
