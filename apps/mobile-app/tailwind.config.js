/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}"
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: '#2872A1',
                'primary-dark': '#16a34a',
                'primary-light': '#CBDDE9',
                secondary: '#1A2517',
                'secondary-dark': '#16a34a',
                'secondary-light': '#ACC8A2',
                'dark-foreground': "#9CA3AF"
            }
        },
    },
    plugins: [],
}