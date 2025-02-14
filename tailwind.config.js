/** @type {import('tailwindcss').Config} */
export default {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "50%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "50%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.5s ease-out forwards",
        "slide-out": "slide-out 0.5s ease-out forwards",
      },
    },
  },
  plugins: [
    // require('@tailwindcss/aspect-ratio'),
  ],
}

