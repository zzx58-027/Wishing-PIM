import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Context } from "hono";

import { pooleFTP_Config } from "../../context/index";
import { inngest } from "../../inngest/client";
import { INNGEST_EVENTS } from "../../inngest/types";

type AppContext = Context<{ Bindings: Env }>;

// 大于 3MB 左右, Insomnia PDF 会无法打开, 浏览器应该可以, 但是 worker 时间可能需要注意.
export class GetFilesDownloadUrl extends OpenAPIRoute {
  schema = {
    tags: ["Poole-FTP"],
    summary: "Get file/files download url.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              files: z.array(z.string()),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Return file/files download_url.",
        content: {
          "application/json": {
            schema: z.object({
              download_url: z.string(),
              file_name: z.string(),
            }),
          },
        },
      },
      "401": {
        description: "Unauthorized.",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
      "500": {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const userInput = await this.getValidatedData<typeof this.schema>();
    const { files } = userInput.body;

    // 不直接提供整个目录的下载方式, 因此只需要判断单个/多个具体文件情况
    let file_name =
      files.length === 1
        ? files[0].split("/").at(-1)
        : `Poole-FTP Files Download - ${files[0]
            .split("/")
            .slice(0, -1)
            .join("/")}.zip`;

    // 尝试请求的函数
    const makeRequest = async (token: string) => {
      return await fetch(pooleFTP_Config.poole_ftp_api_maps.download_files, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        body: JSON.stringify({
          files,
        }),
      });
    };

    let user_token = await c.env.KV.get(pooleFTP_Config.user_token_kv_path);
    let response = await makeRequest(user_token);

    // 如果第一次请求返回401，触发token刷新并重试
    if (!response.ok && response.status === 401) {
      // 触发token刷新
      await inngest.send({
        name: INNGEST_EVENTS.POOLE_FTP.REFRESH_USER_TOKEN,
        data: {},
      });

      // 等待一段时间让token更新完成
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 获取新的token并重试
      user_token = await c.env.KV.get(pooleFTP_Config.user_token_kv_path);
      response = await makeRequest(user_token);

      // 如果重试后仍然是401，返回错误
      if (!response.ok && response.status === 401) {
        c.status(401);
        return {
          message:
            "Unauthorized. If issue persist after retry, please contact the administrator.",
        };
      }
    }

    // 处理其他非200状态码
    if (!response.ok) {
      c.status(500);
      return {
        message: "Request failed with status: " + response.status,
      };
    }

    c.status(200);
    const result = await response.json();

    return {
      download_url: result["link"],
      file_name: file_name,
    };
  }
}
