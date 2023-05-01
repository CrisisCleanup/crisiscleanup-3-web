const path = require('node:path');

/**
 * @type {import("@types/xo").Options}
 */
const xoConfig = {
  prettier: true,
  envs: ['browser', 'es2022'],
  extensions: ['vue', 'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'],
  extends: [path.join(__dirname, '.eslintrc.cjs')],
};

module.exports = xoConfig;
