import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";
import { contextStorage } from "hono/context-storage";

import { serve as inngestServe } from "inngest/hono";
// import { getInngest } from "./inngest/client";
import { inngest } from "./inngest/client";

import * as inngestFuncs from "./inngest/funcs";
import { setPooleFTPSeriviceContext } from "./api/methods/poole-ftp";
// import { getRouteStats } from "./endpoints/routes";
import * as pooleFtpEndpoints from "./endpoints/poole-ftp/index";
import * as s3Endpoints from "./endpoints/common/s3/index";
import { ExtractProductSpecData } from "./endpoints/ai";
// import { MinerUWebhookCallbackHandler } from "./endpoints/webhooks";

const app = new Hono<{ Bindings: Env }>();
app.use(
  "/*",
  cors({
    origin: "*",
  })
);
app.use(
  prettyJSON({
    space: 4,
  })
);
app.use(logger());
app.use(contextStorage());

// 为所有路由提供 hono 上下文的中间件
app.use("*", async (c, next) => {
  setPooleFTPSeriviceContext(c);
  await next();
});

// Chanfana 计划于 3.0 版本默认开启全局错误处理来处理端点抛出错误, 目前文档有误, 需要手动实现全局错误处理逻辑.
// https://github.com/cloudflare/chanfana/issues/278
// 全局错误处理中间件 - 捕获所有端点抛出的异常
app.onError(async (err, c) => {
  console.error("Global error handler caught:", err);

  // 检查是否是 Chanfana 的 ApiException 或其子类
  if (err instanceof ApiException) {
    // 如果是 ApiException，使用其内置的响应格式
    return c.json(
      { success: false, errors: err.buildResponse() },
      err.status as any
    );
  }

  // 处理其他类型的错误
  console.error("Unhandled error:", err);
  return c.json(
    {
      success: false,
      errors: [
        {
          code: 7000,
          // message: `Internal Server Error: ${err} ${JSON.stringify(c.env)}`,
          message: `Internal Server Error: ${err}`,
        },
      ],
    },
    500 as any
  );
});

const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    info: {
      title: "Wishing-PIM OpenAPI",
      version: "1.0.0",
      description: "Documentation for Wishing-PIM.",
      contact: {
        name: "zzx58-027 (Freaky Forward.)",
        url: "https://github.com/zzx58-027",
      },
      license: {
        name: "Apache 2.0",
        url: "https://www.apache.org/licenses/LICENSE-2.0.html",
      },
    },
    servers: [
      {
        url: "http://localhost:5173",
        description: "Development server",
      },
      {
        url: "https://wishing-pim-server.8742236.workers.dev",
        description: "Production server",
      },
    ],
    tags: [
      { name: "Poole-FTP", description: "Operations related to Poole-FTP" },
      {
        name: "S3",
        description:
          "S3 Related Endpoints",
      },
      {
        name: "Webhooks",
        description: "External services webhook callback handlers.",
      },
    ],
  },
});

// // 使用路由管理器注册所有路由
// const routeManager = createRouteManager(openapi);
// // 注册路由组
// routeManager.registerRouteGroups(routeGroups);
// // 注册独立路由
// routeManager.registerRoutes(standaloneRoutes);

// 为 inngest 服务注册路由.
// Cloudflare Workers 部署失败的根本原因是 Inngest 客户端在模块级别初始化时尝试访问环境变量，但在 Cloudflare Workers 环境中，环境变量只在运行时（请求处理期间）可用，而不是在模块加载时可用。这导致了 Invalid URL string 错误。
app.on(["GET", "PUT", "POST"], "/api/inngest", (c) => {
  return inngestServe({
    client: inngest,
    functions: inngestFuncs.allFunctions,
  })(c);
});

// 直接使用 chanfana 的方式注册路由
// 注册 Poole-FTP 路由组
openapi
  .post("/poole-ftp/get-files-list", pooleFtpEndpoints.GetFilesList)
  .post(
    "/poole-ftp/get-files-download-url",
    pooleFtpEndpoints.GetFilesDownloadUrl
  )
  .post("/poole-ftp/download-files", pooleFtpEndpoints.DownloadFiles)
  .get("/poole-ftp/get-user-token", pooleFtpEndpoints.GetUserToken);

// 注册 S3 R2_Temp 路由组
openapi
  .put("/s3/r2_temp/upload", s3Endpoints.UploadFile)
  .delete("/s3/r2_temp/delete/:key", s3Endpoints.UploadFile)
  .get("/s3/r2_temp/get/:key", s3Endpoints.UploadFile)
  .on("head", "/s3/r2_temp/get-info/:key", s3Endpoints.UploadFile);

// 注册 Webhooks 路由组
// openapi.post("/webhooks/minerU", MinerUWebhookCallbackHandler);
openapi.post("/ai/test", ExtractProductSpecData);

// // 打印路由信息（开发环境）
// if (process.env.NODE_ENV !== "production") {
//   // routeManager.printRoutes();
//   // console.log("\n📊 Route Statistics:", getRouteStats());
//   console.log("✅ Routes registered using chanfana OpenAPI methods");
//   console.log("📊 Route Statistics:", getRouteStats());
// }

export default app;
