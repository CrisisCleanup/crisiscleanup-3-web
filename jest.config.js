module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/**/*.stories.js',
    '!**/node_modules/**',
    '!**/*.test.js',
    '!src/services/*.js',
  ],
  // TODO: integrate coveralls or something similiar
  moduleDirectories: ['src', 'node_modules', '.storybook'],
  moduleFileExtensions: ['js', 'json', 'vue'],
  moduleNameMapper: {
    '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|xml)$':
      '<rootDir>/.jest/mocks/image.js',
    '.*\\.(css)$': '<rootDir>/.jest/mocks/cssModule.js',
    '@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    // *.js => babel
    '^.+\\.js$': 'babel-jest',
    // compile any *.vue files with vue-jest
    '^.+\\.vue$': 'vue-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
  setupFiles: [
    'jest-canvas-mock',
    '<rootDir>/.jest/register-context.js',
    '<rootDir>/.jest/mocks/globals.js',
  ],
  snapshotSerializers: ['jest-serializer-vue'],
  globals: {
    'vue-jest': {
      babelConfig: {
        configFile: './babel.config.js',
      },
    },
  },
};
