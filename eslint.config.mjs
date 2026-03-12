import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,

  {
    rules: {
      // Prevent unused vars (important in services)
      "@typescript-eslint/no-unused-vars": ["warn"],

      // Avoid using any
      "@typescript-eslint/no-explicit-any": "warn",

      // Enforce consistent return types
      "@typescript-eslint/explicit-function-return-type": "off",

      // --- Naming conventions (must pass or commit is blocked) ---
      // Order matters: specific selectors first, default last.
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "variable", format: null, filter: { regex: "^__", match: true } },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
        },
        { selector: "parameter", format: ["camelCase"], leadingUnderscore: "allow" },
        {
          selector: "function",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
        },
        { selector: "method", format: ["camelCase"] },
        { selector: "class", format: ["PascalCase"] },
        { selector: "interface", format: ["PascalCase"] },
        { selector: "typeAlias", format: ["PascalCase"] },
        { selector: "enum", format: ["PascalCase"] },
        { selector: "enumMember", format: ["UPPER_CASE", "camelCase", "PascalCase"] },
        { selector: "objectLiteralProperty", format: null },
        { selector: "typeProperty", format: null },
        {
          selector: "import",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
        },
        { selector: "default", format: ["camelCase"], leadingUnderscore: "allow" },
      ],

      // Force consistent imports
      "no-duplicate-imports": "warn",

      // Prevent accidental console logs in production
      "no-console": ["warn", { allow: ["error"] }],

      // Enforce await usage
      "require-await": "warn",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "app/generated/prisma/**",
    "prisma/seed.ts",
  ]),
]);
