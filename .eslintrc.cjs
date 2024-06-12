module.exports = {
  env: {
    node: true
  },
  ignorePatterns: ["lib", "node_modules", "coverage", "docs"],
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:jest/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended"
  ],
  parserOptions: {
    sourceType: "module"
  }
};
