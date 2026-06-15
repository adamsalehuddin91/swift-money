import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                display: ['Fraunces', 'Georgia', 'serif'],
            },
            colors: {
                // Dark-luxe "private wealth" palette
                ink: {
                    DEFAULT: '#0B1120', // base navy/charcoal
                    soft:    '#111A2E', // raised surface
                    card:    '#0F1A30', // card base
                    line:    '#1E2A44', // hairline borders
                },
                gold: {
                    DEFAULT: '#C8A24B',
                    soft:    '#D9BC79',
                    deep:    '#A8842F',
                },
            },
        },
    },

    plugins: [forms],
};
