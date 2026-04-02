import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  // Prettier と競合する ESLint ルールを無効化
  prettier,
  {
    settings: {
      // App Router 使用のため pages ディレクトリを src/app に設定
      next: {
        rootDir: ".",
      },
    },
    rules: {
      // App Router では pages ディレクトリが存在しないため無効化
      "@next/next/no-html-link-for-pages": "off",
      // 未使用変数はエラー（_ プレフィックスは除外）
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // any 型の使用を警告
      "@typescript-eslint/no-explicit-any": "warn",
      // console.log は警告（console.error/warn は許可）
      "no-console": ["warn", { allow: ["error", "warn"] }],
      // React import は Next.js では不要なため off
      "react/react-in-jsx-scope": "off",
    },
  },
]);

export default eslintConfig;
