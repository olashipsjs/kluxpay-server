/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/views/templates/**/*.html',
  ],
  safelist: ['flex', {
    pattern: /^flex-/,
  }],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}

