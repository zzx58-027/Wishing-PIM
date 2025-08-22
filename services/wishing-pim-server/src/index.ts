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
import { routeGroups, standaloneRoutes, getRouteStats } from "./routes/index";

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

app.on(["GET", "PUT", "POST"], "/api/inngest", (c) => {
  return inngestServe({
    client: inngest,
    functions: inngestFuncs.allFunctions,
    // signingKey: c.env.INNGEST_SIGNING_KEY,
  })(c);
});

const openapi = fromHono(app, {
  docs_url: "/",
});

// 使用路由管理器注册所有路由
const routeManager = createRouteManager(openapi);

// 注册路由组
routeManager.registerRouteGroups(routeGroups);

// 注册独立路由
routeManager.registerRoutes(standaloneRoutes);

// 打印路由信息（开发环境）
if (process.env.NODE_ENV !== 'production') {
  routeManager.printRoutes();
  console.log('\n📊 Route Statistics:', getRouteStats());
}

export default app;
