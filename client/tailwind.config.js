/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: 'var(--brand-primary)',
                    light: 'var(--brand-light)',
                },
                page: 'var(--bg-page)',
                card: 'var(--bg-card)',
                hover: 'var(--bg-hover)',
            },
            animation: {
                'gradient': 'gradient 8s ease infinite',
                'fade-up': 'fade-up 0.6s ease-out forwards',
                'bounce-slow': 'bounce 2s infinite',
                'glow': 'glow 2s ease-in-out infinite',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 5px var(--brand-primary)' },
                    '50%': { boxShadow: '0 0 20px var(--brand-primary)' },
                }
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
