/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'vintage-dark': '#0f0f0f',
                'vintage-paper': '#f4f4f0',
                'vintage-ink': '#1a1a1a',
                'vintage-gray': '#737373',
            },
            fontFamily: {
                'sans': ['Inter', 'sans-serif'],
                'mono': ['"Courier New"', 'monospace']
            }
        },
    },
    plugins: [],
}
