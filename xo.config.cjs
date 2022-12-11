module.exports = {
  prettier: true,
  envs: ['browser', 'es2022'],
  rules: {
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'variable',
        format: ['camelCase'],
      },
    ],
  },
};
