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
  transform: {
    // compile any *.vue files with vue-jest
    ".*\\.(vue)$": "vue-jest",
    // *.js => babel
    "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
  },
  snapshotSerializers: ["jest-serializer-vue"]
};
