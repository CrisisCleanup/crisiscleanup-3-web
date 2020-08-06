module.exports = {
  plugins: [
    require('tailwindcss'),
    /**
     * postcss-preset-env
     * @see http://preset-env.cssdb.org/features
     */
    require('postcss-preset-env')({
      stage: 1,
    }),
    require('postcss-nested'),
    require('autoprefixer'),
  ],
};
