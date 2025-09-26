import { serve } from "inngest/hono";
import { Inngest, InngestMiddleware } from "inngest";

/**
 * @param schemas
 * @param funcs
 * @description 为 inngest 服务注册路由.
 * @description Cloudflare Workers 部署失败的根本原因是 Inngest 客户端在模块级别初始化时尝试访问环境变量，
 * 但在 Cloudflare Workers 环境中，环境变量只在运行时（请求处理期间）可用，而不是在模块加载时可用。
 * 这导致了 Invalid URL string 错误。
 */
export const getInngestHonoApp = (
  funcs: Parameters<typeof serve>["0"]["functions"],
  schemas: ConstructorParameters<typeof Inngest>["0"]["schemas"]
) => {
  const inngestHonoApp = new Hono<{ Bindings: Env }>();

  inngestHonoApp.on(["GET", "PUT", "POST"], "/", (c) => {
    const inngestID = "cf-ts-wishing-pim";

    const inngest = new Inngest({
      id: inngestID,
      schemas,
      middleware: [honoBindingsMiddleware],
    });

    return serve({
      client: inngest,
      functions: funcs,
    })(c);
  });

  return inngestHonoApp;
};

/**
 * @description This middleware is used to pass the Cloudflare Workers environment variables
 * to Inngest functions.
 */
// 还不太清楚这个函数, 比较黑盒.
const honoBindingsMiddleware = new InngestMiddleware({
  name: "Cloudflare Workers bindings",
  init({ client, fn }) {
    return {
      onFunctionRun({ ctx, fn, steps, reqArgs }) {
        return {
          transformInput({ ctx, fn, steps }) {
            // reqArgs is the array of arguments passed to the Worker's fetch event handler
            // ex. fetch(request, env, ctx)
            // We cast the argument to the global Env var that Wrangler generates:

            // const [honoCtx] = reqArgs as [Context<{ Bindings: Bindings }>];
            // const [honoCtx] = reqArgs as [Context<{ Bindings: Env }>];
            const env = reqArgs[1] as Env;
            return {
              ctx: {
                // Return the env object to the function handler's input args
                // env: honoCtx.env,
                env,
              },
            };
          },
        };
      },
    };
  },
});
