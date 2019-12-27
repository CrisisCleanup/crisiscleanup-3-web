module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,vue}",
    "!**/node_modules/**",
    "!**/*.test.js"
  ],
  // TODO: integrate coveralls or something similiar
  moduleDirectories: ["src", "node_modules"],
  moduleFileExtensions: ["js", "json", "vue"],
  moduleNameMapper: {
    ".*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/.jest/mocks/image.js"
  },
  transform: {
    // compile any *.vue files with vue-jest
    ".*\\.(vue)$": "vue-jest",
    // *.js => babel
    "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
  },
  snapshotSerializers: ["jest-serializer-vue"]
};
