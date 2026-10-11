/** @type {import("lint-staged").Configuration} */
const config = {
  "*.{js,jsx,mjs,cjs,ts,tsx,mts}": [
    "eslint --max-warnings=0 --fix",
    "prettier --write",
  ],
  "*.{json,md,css,yml,yaml}": ["prettier --write"],
  "{src/env.ts,.env.example}": () => "node scripts/check-env.mjs",
};

export default config;
