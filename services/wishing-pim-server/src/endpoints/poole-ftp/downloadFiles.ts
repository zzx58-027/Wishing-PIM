import { OpenAPIRoute, contentJson, StringParameterType, Str } from "chanfana";
import { z } from "zod";
import { Context } from "hono";
import { stream } from "hono/streaming";

import { downloadFiles, getFilesDownloadUrl } from "@/api/methods/poole-ftp";

type AppContext = Context<{ Bindings: Env }>;

export class DownloadFiles extends OpenAPIRoute {
  schema = {
    tags: ["Poole-FTP"],
    summary: "Get files list at specific path.",
    request: {
      // headers: z.object({
      //   "Authorization": z.string()
      // }), // Specify the request.headers will cause the error.
      body: contentJson(
        z
          .object({
            download_url: z.string().url().optional(),
            files: z.array(z.string().min(1)).nonempty().optional(),
          })
          .superRefine((data, ctx) => {
            // // 空字符串在 JS 中被视为 falsy 值! 空字符串 trim 后仍是空字符串, 仍然为 falsy!!
            // // zod 的错误检测会累加, 不会截断, 此部分需要再次处理 str === '' 的情况.
            const hasDownloadUrl =
              data.download_url !== undefined && data.download_url !== null;

            // 检查是否同时提供了两个字段或都没有提供
            if (
              (hasDownloadUrl && data.files) ||
              (!hasDownloadUrl && !data.files)
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Either 'files' or 'download_url' is required.",
              });
            }
          })
      ),
    },
    responses: {
      "200": {
        description: "Successfully download the file as a stream.",
        content: {
          "application/pdf": {
            schema: Str({ format: "binary" } as StringParameterType),
          },
          "application/zip": {
            schema: Str({ format: "binary" } as StringParameterType),
          },
          "application/octet-stream": {
            schema: Str({ format: "binary" } as StringParameterType),
          },
        },
        headers: {
          "Content-Type": {
            description: "MIME type of the downloaded file",
            schema: {
              type: "string" as const,
            },
          },
          "Content-Length": {
            description: "Size of the downloaded file in bytes",
            schema: {
              type: "string" as const,
            },
          },
          "Content-Disposition": {
            description: "Attachment disposition for file download",
            schema: {
              type: "string" as const,
            },
          },
        },
      },
      ...InputValidationException.schema(),
      ...NotFoundException.schema(),
      // ...ApiException.schema(),
    },
  };

  async handle(c: AppContext) {
    const userInput = await this.getValidatedData<typeof this.schema>();
    const hasDownloadUrl = userInput.body.download_url;

    // 所有数据验证都已在 zod 层面完成

    let download_url: string;
    // 如果不存在 download_url, 则根据 files 生成 download_url
    if (!hasDownloadUrl) {
      // 此时 hasFiles 必定为 true（由于前面的验证逻辑）
      const { download_url: newDownloadUrl, file_name } =
        await getFilesDownloadUrl(userInput.body.files);
      download_url = newDownloadUrl;
    } else {
      download_url = userInput.body.download_url;
    }

    const response = await downloadFiles(download_url);
    if (!response.ok) {
      throw new NotFoundException(
        // Resource 统称代替 File/Files 的单复数准确性问题.
        `Resource not found. Please validate input parameters and URL resource existence.`
      );
    }

    c.status(200);
    c.header("Content-Type", response.headers.get("Content-Type"));
    c.header("Content-Length", response.headers.get("Content-Length"));
    c.header(
      "Content-Disposition",
      response.headers.get("Content-Disposition")
    );
    return stream(c, async (stream) => {
      await stream.pipe(response.body);
    });
  }
}
