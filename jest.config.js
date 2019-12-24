module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["**/*.{js,vue}", "!**/node_modules/**"],
  // TODO: integrate coveralls or something similiar

  moduleFileExtensions: ["js", "json", "vue"],
  transform: {
    // compile any *.vue files with vue-jest
    ".*\\.(vue)$": "vue-jest",
    // *.js => babel
    "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
  },
  snapshotSerializers: ["jest-serializer-vue"]
};
