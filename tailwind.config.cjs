/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
    extend: {
        fontFamily: {
          'russo': ['Russo One', 'sans-serif'],
          'alegreya': ['Alegreya', 'serif'],
          'jost': ['Jost', 'sans-serif'],
        },
    },
    },
    plugins: [],
}