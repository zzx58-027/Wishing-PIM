import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Context } from "hono";

import { getFilesDownloadUrl } from "../../api/index";

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
              files: z.array(z.string().min(1)),
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
    },
  };

  async handle(c: AppContext) {
    const userInput = await this.getValidatedData<typeof this.schema>();
    const { files } = userInput.body;

    return await getFilesDownloadUrl(files);
  }
}
