module.exports = {
  collectCoverage: true,

  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!**/node_modules/**',
    '!src/**/__stories__/**',
  ],

  // cypress tests
  modulePathIgnorePatterns: ['<rootDir>/tests'],

  moduleFileExtensions: ['js', 'json', 'vue', 'node', 'ts'],

  moduleNameMapper: {
    '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|xml)$':
      '<rootDir>/.jest/mocks/image.js',
    '.*\\.(css)$': '<rootDir>/.jest/mocks/cssModule.js',
    '@/(.*)$': '<rootDir>/src/$1',
  },

  transform: {
    // *.js => babel
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
    // compile any *.vue files with jest vue preprocessor
    '^.+\\.vue$': '<rootDir>/node_modules/jest-vue-preprocessor',
  },

  transformIgnorePatterns: [
    // '/node_modules/',
    '/node_modules/(?!(@storybook/.*\\.vue$))',
  ],

  setupFiles: [
    'jest-canvas-mock',
    '<rootDir>/.jest/register-context.js',
    '<rootDir>/.jest/mocks/globals.js',
    '<rootDir>/.jest/setup.js',
  ],

  snapshotSerializers: ['jest-serializer-vue'],
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
};
