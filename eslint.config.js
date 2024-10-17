// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import jest from "eslint-plugin-jest";

export default tseslint.config(
  {
    ignores: ["lib", "node_modules", "coverage", "docs"]
  },
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  jest.configs["flat/recommended"],
  ...tseslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true
        }
      ],
      "no-undef": "off"
    }
  }
);
