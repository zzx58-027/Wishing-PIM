import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Context } from "hono";

import { getFilesList, PooleFTPFileSchema } from "../../api/methods/poole-ftp";

type AppContext = Context<{ Bindings: Env }>;

export class GetFilesList extends OpenAPIRoute {
  schema = {
    tags: ["Poole-FTP"],
    summary: "Get files list at specific path.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              path: z.string().min(1),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Return files list result for a specific path.",
        content: {
          "application/json": {
            schema: z.object({
              files: z.array(PooleFTPFileSchema),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const userInput = await this.getValidatedData<typeof this.schema>();
    const { path } = userInput.body;

    const files = await getFilesList(path);
    c.status(200);
    return {
      files,
    };
  }
}
