const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const tailwindcssNesting = require('tailwindcss/nesting');
const postcssNesting = require('postcss-nesting');

const config = {
    plugins: [
        tailwindcssNesting(),
        //Some plugins, like tailwindcss/nesting, need to run before Tailwind,
        tailwindcss(),
        postcssNesting(),
        //But others, like autoprefixer, need to run after,
        autoprefixer
    ]
};

module.exports = config;
