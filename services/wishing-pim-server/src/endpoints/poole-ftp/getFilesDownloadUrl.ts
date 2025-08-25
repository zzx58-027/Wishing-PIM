import { contentJson, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Context } from "hono";

import { getFilesDownloadUrl, downloadFiles } from "@/api/methods/index";

type AppContext = Context<{ Bindings: Env }>;

// 大于 3MB 左右, Insomnia PDF 会无法打开, 浏览器应该可以, 但是 worker 时间可能需要注意.
// 本端口用于支持前端下载的逻辑. 但不太实用, 目标远程服务没有配套错误检测, 文件不存在仍然返回合法 url, 考虑集成至 downloadFiles 接口中. []
// 现代 HTTP 客户端（fetch、axios、node-fetch）会自动丢弃未消费的响应体。
// 如果仅访问 headers，响应体（文件流）会被自动 cancel()，不会加载到内存。
// 基于前两点, 我们可以构造请求, 判断是否文件存在, 存在则返回 url, 不存在则返回错误. 因此这个端点可以保留, 继续支持前端逻辑实现.
export class GetFilesDownloadUrl extends OpenAPIRoute {
  schema = {
    tags: ["Poole-FTP"],
    summary: "Get file/files download url.",
    request: {
      body: contentJson(
        z.object({
          files: z.array(z.string().min(1)).nonempty(),
        })
      ),
    },
    responses: {
      "200": {
        description: "Return file/files download_url.",
        content: {
          "application/json": {
            schema: z.object({
              download_url: z.string(),
            }),
            example: {
              download_url:
                "https://poolelighting.ftpstream.com/files/download/HImQWzkbR6CiRLzot3ZJ",
              file_name: "Endon 102369.pdf",
            },
          },
        },
      },
      ...NotFoundException.schema(),
    },
  };

  async handle(c: AppContext) {
    const userInput = await this.getValidatedData<typeof this.schema>();
    const { files } = userInput.body;

    // 此处无法验错, 目标远程服务没有配套错误检测, 文件不存在仍然返回合法 url.
    const { download_url } = await getFilesDownloadUrl(userInput.body.files);
    const response = await downloadFiles(download_url);
    if (!response.ok) {
      throw new NotFoundException(
        `File not found. Please validate input parameters and URL resource existence.`
      );
    }

    c.status(200);
    c.header("Content-Type", response.headers.get("Content-Type"));
    c.header("Content-Length", response.headers.get("Content-Length"));
    c.header(
      "Content-Disposition",
      response.headers.get("Content-Disposition")
    );

    return {
      download_url,
    };
  }
}
