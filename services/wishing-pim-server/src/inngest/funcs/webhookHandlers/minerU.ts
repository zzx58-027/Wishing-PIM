// import { inngestSingleton } from "@/inngest/client";
import { inngest } from "@/inngest/client";
import { INNGEST_EVENTS, InngestEvent } from "@/inngest/types";

// export const minerUWebhookCallback = inngestSingleton.createFunction(
export const minerUWebhookCallback = inngest.createFunction(
  {
    id: "minerU-webhook-callback",
  },
  {
    event: INNGEST_EVENTS.WEBHOOKS.MINERU,
  },
  // 根据当前中间件实现, env 应该通过 ctx.env 访问，而不是直接作为参数
  async ({ event, step, env }) => {
    console.log(event, step, env);
    // return env;
    // return 12345
    // return step
    return event
  }
);
