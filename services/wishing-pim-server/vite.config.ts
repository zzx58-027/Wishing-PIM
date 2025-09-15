import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import AutoExport from "unplugin-auto-export/vite";
import AutoImport from "unplugin-auto-import/vite";
import * as radash from "radash";
import { resolve } from "path";

export default defineConfig({
  server: {
    host: true,
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: resolve(__dirname, "src"),
      },
    ],
  },
  plugins: [
    cloudflare(),
    AutoExport({
      path: [
        "**/api/**/*",
        "**/endpoints/**/*",
        "**/inngest/funcs/**/*",
        "**/utils/*",
      ],
      ignore: ["**/node_modules/*"],
      extname: "ts",
      formatter: (filename, extname) => `export * from './${filename}'`,
    }),
    AutoImport({
      dts: true,
      dirs: ["src/utils"],
      imports: [
        {
          zod: ["z"],
        },
        {
          // Radash 自动导入函数添加前缀避免冲突
          radash: Object.keys(radash)
            .filter((key) => typeof (radash as any)[key] === "function")
            .map((fnName) => [fnName, `_${fnName}`]) as [string, string][],
        },
        {
          chanfana: [
            "NotFoundException",
            "InputValidationException",
            "ApiException",
            "MultiException",
          ],
        },
        {
          ufo: ["withQuery", "joinURL"],
        },
      ],
    }),
  ],
});
