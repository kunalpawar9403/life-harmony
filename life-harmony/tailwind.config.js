/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        screens: {
            'xs': '420px',
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
        },
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                display: ['Outfit', '"Space Grotesk"', 'sans-serif'],
                mono: ['"Space Grotesk"', 'monospace'],
            },
            colors: {
                brand: {
                    dark: '#1c1c21',
                    charcoal: '#2e2e34',
                    muted: '#6f6f78',
                    periwinkle: '#adc8f8',
                    sage: '#c3e2cb',
                    blush: '#f5c6d6',
                    cream: '#fdfbf9',
                    sand: '#f4ede6',
                },
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.05)',
                'card-hover': '0 20px 40px -15px rgba(28, 28, 33, 0.12)',
                'glow': '0 0 25px rgba(173, 200, 248, 0.45)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'float 9s ease-in-out infinite',
                'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
                'shimmer': 'shimmer 2.5s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseSubtle: {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.85', transform: 'scale(1.02)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [],
};