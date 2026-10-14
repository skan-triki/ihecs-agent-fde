// Politique ZÉRO TOLÉRANCE : toute règle est en "error" et `pnpm lint` échoue au moindre warning.
// Ne désactivez jamais une règle sans validation de l'enseignant (voir AGENTS.md).
import eslintComments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import llmCore from "eslint-plugin-llm-core";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // TypeScript : niveau le plus strict, avec vérification des types.
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // JavaScript / React / Next : bonnes pratiques.
  {
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "object-shorthand": "error",
      "prefer-template": "error",
      "no-nested-ternary": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/router",
              message: "App Router : utilisez 'next/navigation'.",
            },
            {
              name: "next/head",
              message:
                "App Router : utilisez l'export `metadata` / `generateMetadata`.",
            },
            {
              name: "clsx",
              message: "Utilisez `cn` depuis '@/design-system/utils'.",
            },
            {
              name: "tailwind-merge",
              message: "Utilisez `cn` depuis '@/design-system/utils'.",
            },
            {
              name: "process",
              message: "Utilisez `env` depuis '@/env'.",
            },
          ],
          patterns: [
            {
              group: ["../*", "./../*"],
              message:
                "Utilisez l'alias '@/…' au lieu des imports relatifs parents.",
            },
            {
              group: ["@/components/ui/*", "@/lib/utils"],
              message:
                "Source unique : le design system vit dans '@/design-system/…' (composants : '@/design-system/components/…', utilitaires : '@/design-system/utils').",
            },
          ],
        },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "Accès direct interdit : déclarez la variable dans src/env.ts et importez `env` depuis '@/env'.",
        },
      ],

      "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
      "react/self-closing-comp": "error",
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never" },
      ],
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-no-leaked-render": [
        "error",
        { validStrategies: ["ternary", "coerce"] },
      ],
      "react/no-array-index-key": "error",
      "react/no-unstable-nested-components": "error",
      "react/jsx-pascal-case": "error",
      "react/hook-use-state": "error",
      "react/button-has-type": "error",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],

      ...jsxA11y.flatConfigs.strict.rules,

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Pièges typiques du code généré par IA : imports vers des modules ou
      // des exports qui n'existent pas, eval/new Function, code commenté
      // laissé « au cas où ». Mécanique, pas convention.
      "llm-core/no-hallucinated-local-imports": "error",
      "llm-core/no-hallucinated-package-imports": "error",
      "llm-core/no-dynamic-code-execution": "error",
      "llm-core/no-commented-out-code": "error",
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      "llm-core": llmCore,
    },
  },

  // Cycles d'imports : une boucle a → b → a compile parfaitement mais produit
  // des `undefined` silencieux au runtime. Refusée, alias `@/` compris.
  {
    files: ["src/**/*.{ts,tsx,mts}", "scripts/**/*.mjs"],
    plugins: { "import-x": importX },
    settings: {
      "import-x/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx", ".mts"],
      },
      "import-x/resolver": { typescript: true, node: true },
    },
    rules: {
      "import-x/no-cycle": ["error", { maxDepth: 10, ignoreExternal: true }],
    },
  },

  // Tailwind CSS v4 : classes valides, canoniques, sans doublon ni conflit.
  // L'ordre des classes est géré par prettier-plugin-tailwindcss.
  {
    extends: [betterTailwindcss.configs["recommended-error"]],
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/design-system/globals.css",
      },
    },
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": "off",
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      // Classes "marqueurs" fournies par des librairies tierces (ex. sonner), sans style Tailwind.
      "better-tailwindcss/no-unknown-classes": [
        "error",
        { ignore: ["^toaster$"] },
      ],
    },
  },

  // SOURCE UNIQUE DU DESIGN SYSTEM : hors de src/design-system/, seuls les
  // tokens sémantiques sont autorisés — pas de couleurs brutes (palette ou hex)
  // dans le code applicatif. On change le thème dans globals.css, nulle part ailleurs.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/design-system/**"],
    rules: {
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          restrict: [
            {
              pattern:
                "(bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|divide|shadow)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-.*",
              message:
                "Couleur brute interdite : utilisez les tokens sémantiques (ex. bg-background, text-muted-foreground, border-border). Le thème se règle UNIQUEMENT dans src/design-system/globals.css.",
            },
            {
              pattern:
                "(bg|text|border|ring|fill|stroke|from|via|to)-\\[(#|rgb|hsl|oklch)[^\\]]*\\]",
              message:
                "Couleur hex/brute interdite : utilisez les tokens sémantiques. Le thème se règle UNIQUEMENT dans src/design-system/globals.css.",
            },
            {
              pattern: "(bg|text|border)-(black|white)\\b.*",
              message:
                "Noir/blanc bruts interdits : utilisez bg-background, text-foreground, border-border. Le thème se règle UNIQUEMENT dans src/design-system/globals.css.",
            },
          ],
        },
      ],
    },
  },

  // Commentaires eslint-disable : interdits sans justification.
  eslintComments.recommended,
  {
    rules: {
      "@eslint-community/eslint-comments/no-unlimited-disable": "error",
      "@eslint-community/eslint-comments/require-description": "error",
      "@eslint-community/eslint-comments/no-unused-disable": "error",
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
  },

  // Exceptions ciblées (fichiers de configuration et validation d'env).
  {
    files: ["src/env.ts", "*.config.{ts,mjs,js}", "scripts/**"],
    rules: {
      "no-restricted-properties": "off",
      "no-console": "off",
    },
  },

  // Scripts Node du cours : l'alias `@/` n'existe que dans `src/` (TypeScript),
  // les scripts partagent leurs modules par chemins relatifs (scripts/lib/).
  {
    files: ["scripts/**"],
    rules: {
      "no-restricted-imports": "off",
    },
  },

  prettier,

  globalIgnores([
    ".pnpm-store/**",
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
