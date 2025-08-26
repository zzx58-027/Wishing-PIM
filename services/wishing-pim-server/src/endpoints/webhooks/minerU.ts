import { OpenAPIRoute, contentJson, StringParameterType, Str } from "chanfana";
import { randomUUID } from "crypto";
import { Context } from "hono";
import { stream } from "hono/streaming";
// z 为统一导出入口, 包含类型 z, 无法使用自动导入.
import { z } from "zod";

type AppContext = Context<{ Bindings: Env }>;

const minerUCallbackRequestObject = z.object({
  code: z.number(),
  msg: z.string(),
  trace_id: z.string(),
  data: z.object({
    batch_id: z.string(),
    extract_result: z.array(
      z.object({
        file_name: z.string(),
        state: z.string(),
        err_msg: z.string(),
        data_id: z.string(),
        full_zip_url: z.string().optional(),
        extract_progress: z
          .object({
            extract_progress: z.number(),
            total_pages: z.number(),
            start_time: z.string(),
          })
          .optional(),
      })
    ),
  }),
});

type MinerUWebhookCallbackRequest = z.infer<typeof minerUCallbackRequestObject>;

export class MinerUWebhookCallbackHandler extends OpenAPIRoute {
  schema = {
    tags: ["Webhooks"],
    summary: "MinerU Webhook Callback Handler",
    description: "处理 MinerU 文件处理完成后的回调",
    request: {
      body: contentJson(minerUCallbackRequestObject),
    },
    responses: {
      "200": {
        description: "成功",
      },
    },
  };

  async handle(c: AppContext) {

  }
}
