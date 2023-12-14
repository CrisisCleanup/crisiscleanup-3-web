/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      backgroundImage(theme) {
        const caret = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><g fill="none" fill-rule="evenodd"><path fill="#FFF" d="M49 0h1v1h-1zM0 49h1v1H0z" opacity=".01"/><g fill="#353535" fill-rule="nonzero"><path d="M25 20l5 3.75H20zM25 30l5-3.75H20z"/></g></g></svg>`;
        const spinner = `<svg viewBox="0 0 512 512" fill="${theme(
          'colors.green.500',
        )}" xmlns="http://www.w3.org/2000/svg"><path d="M456.433 371.72l-27.79-16.045c-7.192-4.152-10.052-13.136-6.487-20.636 25.82-54.328 23.566-118.602-6.768-171.03-30.265-52.529-84.802-86.621-144.76-91.424C262.35 71.922 256 64.953 256 56.649V24.56c0-9.31 7.916-16.609 17.204-15.96 81.795 5.717 156.412 51.902 197.611 123.408 41.301 71.385 43.99 159.096 8.042 232.792-4.082 8.369-14.361 11.575-22.424 6.92z"></path></svg>`;
        const remove = `<svg viewBox="0 0 320 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z"></path></svg>`;

        return {
          'multiselect-caret': `url("data:image/svg+xml;utf8,${encodeURIComponent(
            caret,
          )}")`,
          'multiselect-spinner': `url("data:image/svg+xml;utf8,${encodeURIComponent(
            spinner,
          )}")`,
          'multiselect-remove': `url("data:image/svg+xml;utf8,${encodeURIComponent(
            remove,
          )}")`,
        };
      },
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      rounded: ['first', 'last'],
      fontSize: {
        h1: '1.25rem', //         ~18px
        h2: '1rem', //            ~16px
        h3: '0.875rem', //        ~14px
        h4: '.75rem', //          ~12px
        body: '.9375rem', //      ~15px
        bodysm: '.835rem', //      ~13px
        bodyxsm: '.65rem', //      ~10px
      },
      maxHeight: {
        sm: '2rem',
        md: '4rem',
        lg: '6rem',
        xl: '8rem',
      },
      minHeight: {
        sm: '2rem',
        md: '4rem',
        lg: '6rem',
        xl: '8rem',
      },
      fontWeight: {
        h1: '600',
        h2: '700',
        h3: '700',
        h4: '700',
        body: '400',
        bodysm: '400',
      },
      colors: {
        primary: {
          light: '#fece09',
          dark: '#f79820',
        },
        'phone-inbound': {
          light: '#C9EBF5',
          dark: '#05A4D2',
        },
        'phone-outbound': {
          light: '#C6F0CF',
          dark: '#419954',
        },
        'phone-calldown': {
          light: '#F9CEDA',
          dark: '#973752',
        },
        'crisiscleanup-dark': {
          100: '#dadada',
          200: '#b8b8b8',
          300: '#818181',
          400: '#555555',
          500: '#2d2d2d',
        },
        'crisiscleanup-green': {
          100: '#13E768',
          200: '#11DD60',
          300: '#0ED258',
          400: '#0CC850',
          500: '#0ABD48',
          600: '#07B33F',
          700: '#05A837',
          800: '#029E2F',
          900: '#009327',
        },
        'crisiscleanup-red': {
          100: '#FF6C70',
          200: '#F95F62',
          300: '#F35154',
          400: '#ED4446',
          500: '#E73638',
          600: '#E0292A',
          700: '#DA1B1C',
          800: '#D40E0E',
          900: '#CE0000',
        },
        'crisiscleanup-yellow': {
          100: '#FFDC68',
          200: '#FFD55D',
          300: '#FFCE51',
          400: '#FFC746',
          500: '#FFC03B',
          600: '#FFB92F',
          700: '#FFB224',
          800: '#FFAB18',
          900: '#FFA40D',
        },
        'crisiscleanup-lightblue': {
          100: '#8EEBFF',
          200: '#7CE5FC',
          300: '#6BDFF9',
          400: '#59D9F6',
          500: '#47D3F3',
          600: '#35CDF0',
          700: '#24C7ED',
          800: '#12C1EA',
          900: '#CFE9F7',
        },
        'crisiscleanup-grey': {
          100: '#D8D8D8',
          200: '#D0D0D0',
          300: '#C9C9C9',
          400: '#C1C1C1',
          500: '#BABABA',
          600: '#B2B2B2',
          700: '#AAAAAA',
          800: '#A3A3A3',
          900: '#9B9B9B',
        },
        'litepie-primary': colors.sky,
        'litepie-secondary': colors.gray,
        'crisiscleanup-teal': '#4fbdb0',
        'crisiscleanup-dark-red': '#ed4747',
        'crisiscleanup-dark-blue': '#009bff',
        'crisiscleanup-light-grey': '#f9f9f9',
        'crisiscleanup-light-smoke': '#f2f3f4',
        'crisiscleanup-smoke': '#f7f7f7',
        'crisiscleanup-chat-blue': '#E4F5FF',
        'crisiscleanup-chat-red': '#ED4747',
        'crisiscleanup-grid-blue': '#CFE9F7',
        'crisiscleanup-grid-grey': '#F2F4F4',
        'crisiscleanup-grid-yellow': '#FECE09',
      },
      spacing: {
        18: '4.5rem',
        72: '18rem',
        84: '21rem',
        96: '24rem',
        108: '27rem',
        120: '30rem',
        132: '33rem',
        144: '36rem',
        156: '39rem',
        168: '42rem',
        180: '45rem',
      },
      boxShadow: {
        'crisiscleanup-card': '0 0 14px 0 rgba(164, 177, 184, 0.18)',
      },
      gridRow: {
        'span-7': 'span 7 / span 7',
        'span-8': 'span 8 / span 8',
      },
      gridTemplateRows: {
        12: 'repeat(12, minmax(0, 1fr))',
        30: 'repeat(30, 1fr)',
      },
    },
  },
  variants: {
    extend: {
      cursor: ['disabled'],
      textOpacity: ['disabled'],
      textColor: ['disabled'],
    },
  },
  plugins: [],
};
