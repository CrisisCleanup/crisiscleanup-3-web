module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint",
    "prettier",
    "vue",
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    'plugin:vue/vue3-essential',
    "prettier"
  ],
  "rules": {
    "no-console": 1,       // Means warning
    "prettier/prettier": 2 // Means error
  }
}
