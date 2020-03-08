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
  moduleDirectories: ['src', 'node_modules'],
  moduleFileExtensions: ['js', 'json', 'vue'],
  moduleNameMapper: {
    '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/.jest/mocks/image.js',
    '@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    // *.js => babel
    '^.+\\.js$': 'babel-jest',
    // compile any *.vue files with vue-jest
    '^.+\\.vue$': 'vue-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
  setupFiles: ['jest-canvas-mock'],
  snapshotSerializers: ['jest-serializer-vue'],
  globals: {
    'vue-jest': {
      babelConfig: {
        configFile: './babel.config.js',
      },
    },
  },
};
