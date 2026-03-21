/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#544683",
        lavender: "#e4b5fb",
        lilac: "#936fb3",
        orchid: "#a485b4",
        plum: "#ae89cf",
        violet: "#b485d3",
        blush: "#c49aaf",
        rose: "#e095c2",
        snow: "#f4f1f0",
        petal: "#ebcef4",
        cotton: "#fdd1e6",
      },
      backgroundImage: {
        light: "url('/images/light-theme.jpg')",
        dark: "url('/images/dark-theme.jpg')",
        dashboard: "url('/images/dashboard-theme.jpg')",
        // add more named images here
      }
    },
  },
  plugins: [],
};