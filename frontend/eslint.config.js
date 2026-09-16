import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.{ts,vue}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { parser: tseslint.parser },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  eslintConfigPrettier,
);
