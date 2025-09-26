// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  // --- FINAL BADLAV START ---
  // Tailwind ko aapke sahi folder structure ke baare mein bataya gaya hai
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",               // Root folder ki files (App.tsx, index.tsx)
    "./pages/**/*.{js,ts,jsx,tsx}",     // pages folder ke andar ki sabhi files
    "./components/**/*.{js,ts,jsx,tsx}",  // components folder ke andar ki sabhi files
    "./context/**/*.{js,ts,jsx,tsx}",   // context folder ke andar ki sabhi files
    "./admin/**/*.{js,ts,jsx,tsx}",     // admin folder ke andar ki sabhi files
  ],
  // --- FINAL BADLAV END ---
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'primary': '#FFA500',
        'brand-yellow': '#FEF3C7',

        'brand-orange': '#FDBA74',
        'brand-black': '#2D3436',
        'text-primary': '#1A202C',
        'text-secondary': '#6B7280',
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gentle-float-1': 'gentle-float-1 6s ease-in-out infinite',
        'gentle-float-2': 'gentle-float-2 7s ease-in-out infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)'},
        },
        'gentle-float-1': {
          '0%, 100%': { transform: 'translateY(0px) rotate(-12deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-10deg)' },
        },
        'gentle-float-2': {
          '0%, 100%': { transform: 'translateY(0px) rotate(12deg)' },
          '50%': { transform: 'translateY(-10px) rotate(14deg)' },
        },
      }
    },
  },
  plugins: [],
}