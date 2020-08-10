module.exports = {
  plugins: [
    require('tailwindcss'),
    /**
     * postcss-preset-env
     * @see http://preset-env.cssdb.org/features
     */
    require('postcss-extend-rule'),
    require('postcss-advanced-variables')({
      disable: '@import',
    }),
    require('postcss-preset-env')({
      stage: 1,
    }),
    require('postcss-atroot'),
    require('postcss-property-lookup'),
    require('postcss-nested'),
    require('postcss-will-change-transition'),
    require('postcss-will-change'),
    require('postcss-responsive-type'),
    require('postcss-easings'),
    require('lost'),
    require('autoprefixer'),
    require('postcss-pxtorem')({
      propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
    }),
    require('postcss-reporter'),
  ],
};
