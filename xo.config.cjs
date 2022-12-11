const eslintConfig = require('./.eslintrc.cjs');

module.exports = {
  prettier: true,
  envs: ['browser', 'es2022'],
  rules: {
    ...eslintConfig.rules,
  },
};
