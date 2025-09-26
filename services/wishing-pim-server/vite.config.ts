import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import AutoExport from "unplugin-auto-export/vite";
import AutoImport from "unplugin-auto-import/vite";
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
        "**/utils/*",
        "**/modules/*",
        "**/services/**/*",
      ],
      ignore: ["**/node_modules/*"],
      extname: "ts",
      formatter: (filename, extname) => `export * from './${filename}'`,
    }),
    AutoImport({
      dts: true,
      dirs: ["src/utils", "src/modules"],
      imports: [
        { danfojs: [["*", "dfd"]] },
        { from: "danfojs", imports: [["*", "dfdType"]], type: true },
        { "p-queue": [["default", "PQueue"]] },
        { "p-throttle": [["default", "PThrottle"]] },
        { from: "p-queue", imports: [["default", "PQueueType"]], type: true },
        {
          from: "p-throttle",
          imports: [["default", "PThrottleType"]],
          type: true,
        },
        { zod: ["z"] },
        { from: "zod", imports: [["z", "zodType"]], type: true },
        { zod4: [["z", "zod4"]] },
        { from: "zod4", imports: [["z", "zod4Type"]], type: true },
        { axios: [["default", "axios"]] },
        { from: "axios", imports: ["AxiosInstance"], type: true },
        { hono: ["Hono"] },
        {
          from: "hono",
          imports: [
            ["Context", "HonoContext"],
            ["Hono", "HonoType"],
          ],
          type: true,
        },
        { "hono/factory": ["createMiddleware"] },
        { ufo: ["withQuery", "joinURL"] },
        { radash: [] },
        {
          chanfana: [
            "NotFoundException",
            "InputValidationException",
            "ApiException",
            "MultiException",
            "OpenAPIRoute",
            "contentJson",
            "fromHono",
          ],
        },
      ],
    }),
  ],
});

// {
//   // Radash 自动导入函数添加前缀避免冲突
//   // radash: Object.keys(radash)
//   //   .filter((key) => typeof (radash as any)[key] === "function")
//   //   .map((fnName) => [fnName, `_${fnName}`]) as [string, string][],
//   radash: [],
// },
