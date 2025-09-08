import { inngest } from "@/inngest/client";

// 事件名称常量
export const MINERU_WEBHOOK_EVENT = "webhooks/minerU" as const;

// 事件数据类型
export interface MinerUWebhookEventData {
  test: string;
}

// 事件类型
export interface MinerUWebhookEvent {
  name: typeof MINERU_WEBHOOK_EVENT;
  data: MinerUWebhookEventData;
}

// Function 处理器
export const minerUWebhookCallback = inngest.createFunction(
  {
    id: "minerU-webhook-callback",
  },
  {
    event: MINERU_WEBHOOK_EVENT,
  },
  async ({ event, step, env }) => {
    console.log(event, step, env);
    return event;
  }
);
