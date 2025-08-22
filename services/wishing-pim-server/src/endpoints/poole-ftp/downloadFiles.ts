import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Context } from "hono";
import { stream } from "hono/streaming";

import {
  downloadFiles,
  getFilesDownloadUrl,
} from "../../api/methods/poole-ftp";

type AppContext = Context<{ Bindings: Env }>;

export class DownloadFiles extends OpenAPIRoute {
  schema = {
    tags: ["Poole-FTP"],
    summary: "Get files list at specific path.",
    request: {
      // headers: z.object({
      //   "Authorization": z.string()
      // }), // Specify the request.headers will cause the error.
      body: {
        content: {
          "application/json": {
            schema: z
              .object({
                download_url: z.string(),
                files: z.array(z.string().min(1)),
              })
              .partial(),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Successfully download the file as a stream.",
        content: {
          "application/pdf": {
            schema: {
              type: "string" as const,
              format: "binary" as const,
            },
          },
          "application/zip": {
            schema: {
              type: "string" as const,
              format: "binary" as const,
            },
          },
          "application/octet-stream": {
            schema: {
              type: "string" as const,
              format: "binary" as const,
            },
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
      "500": {
        description:
          "Error: Please validate input parameters and URL resource existence.",
        content: {
          "text/html": {
            schema: {},
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const userInput = await this.getValidatedData<typeof this.schema>();

    console.log("zzx58:", userInput.body);
    let download_url: string;
    if (!userInput.body.download_url) {
      const { download_url: newDownloadUrl, file_name } =
        await getFilesDownloadUrl(userInput.body.files);
      download_url = newDownloadUrl;
    }

    const response = await downloadFiles(download_url);
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
