import { OpenAPIRoute, contentJson, StringParameterType, Str } from "chanfana";
import { Context } from "hono";
import { inngest } from "@/inngest/client";
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
      // body: contentJson(minerUCallbackRequestObject),
    },
    responses: {
      "200": {
        description: "成功",
      },
    },
  };

  // 本系统的 MinerU 主要应用场景为产品 Spec 文档的解析.
  // 原计划使用 MinerU, 但是根据测试, 表现效果不如人意, 暂时搁置, 重回 大模型直接处理 方式.
  // webhook 回调处理和文件管理仍然值得掌握.
  async handle(c: AppContext) {
    const req = await c.req.json();
    const parsedReq = minerUCallbackRequestObject.parse(req);
    parsedReq.data.extract_result.forEach(async (item) => {
      if (item.state === "success") {
        const { data_id, file_name } = item;
        // 下载文件
        const response = await fetch(item.full_zip_url);
        // 不考虑非 stream 方式处理.
        // const arrayBuffer = await response.arrayBuffer();
        // const buffer = Buffer.from(arrayBuffer);
        // 上传文件到 S3
        const s3Key = `minerU/${file_name}.zip`;
        await c.env.R2_Main.put(s3Key, response.body);
      }
    });
    return await inngest.send({
      // name: INNGEST_EVENTS.WEBHOOKS.MINERU,
      // name: MINERU_WEBHOOK_EVENT,
      name: "webhooks/minerU",
      data: {
        test: "hello, i am zzx",
      },
    });
  }
}
