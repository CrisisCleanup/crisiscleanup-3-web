/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
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
  variants: {},
  plugins: [],
}
