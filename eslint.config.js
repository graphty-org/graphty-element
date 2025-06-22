import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";
import globals from 'globals'

export default tseslint.config(
    eslint.configs.recommended,
    // tseslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
      {
    languageOptions: {
      parserOptions: {
        projectService: "./tsconfig.json",
        // projectService: true,
        // sourceType: 'module',
        // allowDefaultProject: [
        //   "*.mjs", "*.js", "eslint.config.mjs", ".storybook",
        // ],
        // globals: globals.browser,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  //   {
  //   files: ['**/*.js'],
  //   extends: [tseslint.configs.disableTypeChecked],
  // },
    {
        // ignores: [
        //     "dist",
        //     "storybook-static",
        //     "coverage",
        // ],
        plugins: {
            "@stylistic": stylistic,
        },
        rules: {
            /**********************
             * STYLE
             **********************/
            "camelcase": ["error", {properties: "always"}],
            "@stylistic/indent": ["error", 4, {ignoredNodes: ["PropertyDefinition"]}],
            "@stylistic/linebreak-style": ["error", "unix"],
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/semi": ["error", "always"],
            "@stylistic/comma-dangle": ["error", "always-multiline"],
            "@stylistic/comma-style": ["error", "last"],
            /**********************
             * SAFETY
             **********************/
            // "@typescript-eslint/no-floating-promises": "error"
        },
    },
);