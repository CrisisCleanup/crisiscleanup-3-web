import autoprefixer from 'autoprefixer';
import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';
import tailwindNesting from 'tailwindcss/nesting';

export default {
  plugins: [postcssImport, tailwindNesting, tailwindcss, autoprefixer],
};
