import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";
import { contextStorage } from "hono/context-storage";

export const getAssembledHonoApp = () => {
  const app = new Hono<{ Bindings: Env }>();

  // Hono Native Plugins
  app.use(
    prettyJSON({
      space: 4,
    })
  );
  app.use(logger());
  app.use(contextStorage());

  // HonoErrorHandleLogics
  honoErrorHandleLogic(app);

  return app;
};

const honoErrorHandleLogic = (app: HonoType<{ Bindings: Env }>) => {
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
};
