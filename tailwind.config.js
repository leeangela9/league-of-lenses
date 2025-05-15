/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["*.{html,js}"],
  theme: {
    extend: {
      backgroundImage: {
        "blue-gradient":
          "linear-gradient(to left bottom, #0a1428, #0b172d, #0c1a33, #0d1c38, #0e1f3e, #0f2545, #102a4d, #103054, #0f3a60, #0c446b, #074f77, #005a82)",
      },
    },
  },
  plugins: [],
};
