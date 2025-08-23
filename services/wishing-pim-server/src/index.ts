import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";
import { contextStorage } from "hono/context-storage";

import { serve as inngestServe } from "inngest/hono";
import { inngest } from "./inngest/client";

import * as inngestFuncs from "./inngest/funcs";
import { setPooleFTPSeriviceContext } from "./api";
import { createRouteManager } from "./utils/routeManager";
import {
  routeGroups,
  standaloneRoutes,
  getRouteStats,
} from "./endpoints/routes";

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
        url: "https://wishing-pim-server.8742236.workers.dev",
        description: "Production server",
      },
      {
        url: "http://localhost:5173",
        description: "Development server",
      },
    ],
    tags: [
      { name: "Poole-FTP", description: "Operations related to Poole-FTP" },
    ],
  },
});

app.on(["GET", "PUT", "POST"], "/api/inngest", (c) => {
  return inngestServe({
    client: inngest,
    functions: inngestFuncs.allFunctions,
    // signingKey: c.env.INNGEST_SIGNING_KEY,
  })(c);
});

// 使用路由管理器注册所有路由
const routeManager = createRouteManager(openapi);

// 注册路由组
routeManager.registerRouteGroups(routeGroups);

// 注册独立路由
routeManager.registerRoutes(standaloneRoutes);

// 打印路由信息（开发环境）
if (process.env.NODE_ENV !== "production") {
  routeManager.printRoutes();
  console.log("\n📊 Route Statistics:", getRouteStats());
}

export default app;
