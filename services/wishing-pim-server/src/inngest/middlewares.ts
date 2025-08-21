import { type Context } from "hono";
import { InngestMiddleware } from "inngest";
// import { type Bindings } from '../bindings';

/**
 * This middleware is used to pass the Cloudflare Workers environment variables
 * to Inngest functions.
 */
export const honoBindingsMiddleware = new InngestMiddleware({
  name: "Cloudflare Workers bindings",
  init({ client, fn }) {
    return {
      onFunctionRun({ ctx, fn, steps, reqArgs }) {
        return {
          transformInput({ ctx, fn, steps }) {
            // const [honoCtx] = reqArgs as [Context<{ Bindings: Bindings }>];
            const [honoCtx] = reqArgs as [Context<{ Bindings: Env }>];
            return {
              ctx: {
                env: honoCtx.env,
              },
            };
          },
        };
      },
    };
  },
});
