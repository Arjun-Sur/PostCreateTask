/** @type {import('tailwindcss').Config}*/
const config = {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte-blocks/**/*.{html,js,svelte,ts}'],

  plugins: [require('flowbite/plugin'), require('flowbite-typography')],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F7E6E8',
          100: '#E4A6AF',
          200: '#D9808D',
          300: '#CE596B',
          400: '#C64054',
          500: '#BE263D',
          600: '#B70D26',
          700: '#A10018',
          800: '#980017',
          900: '#7D0013'
        },
        text: '#F4E2E4',
        background: '#16090B',
        primarySingle: '#B3001B',
        secondary: '#120709',
        accent: '#A5404F',
      }
    }
  }
};

module.exports = config;
