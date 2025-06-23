import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        ignores: [
            "dist",
            "storybook-static",
            "coverage",
        ],
    },
    {
        languageOptions: {
            parserOptions: {
                sourceType: "module",
                globals: globals.browser,
                tsconfigRootDir: import.meta.dirname,
                projectService: {
                    allowDefaultProject: ["*.js", "*.mjs"],
                },
            },
        },
    },
    {
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
            /**********************
             * MIGRATION
             **********************/
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
        },
    },
);