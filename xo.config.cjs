const eslintConfig = require('./.eslintrc.cjs');

/**
 * @type {import("@types/xo").Options}
 */
const xoConfig = {
  prettier: true,
  envs: ['browser', 'es2022'],
  rules: {
    ...eslintConfig.rules,
  },
};

module.exports = xoConfig;
