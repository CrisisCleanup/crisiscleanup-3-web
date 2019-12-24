module.exports = {
  presets: [
    ["env", { modules: false }],
    [
      "@vue/babel-preset-jsx",
      {
        injectH: false
      }
    ],
    [
      "@vue/app",
      {
        useBuiltIns: "entry"
      }
    ]
  ],
  env: {
    test: {
      presets: [["env", { targets: { node: "current" } }]]
    }
  }
};
