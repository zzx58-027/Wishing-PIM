import { contentJson, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Context } from "hono";

import { getFilesList, PooleFTPFileSchema } from "@/api/methods/poole-ftp";

type AppContext = Context<{ Bindings: Env }>;

export class GetFilesList extends OpenAPIRoute {
  schema = {
    tags: ["Poole-FTP"],
    summary: "Get files list at specific path.",
    request: {
      body: contentJson(
        z.object({
          path: z.string().min(1),
        })
      ),
    },
    responses: {
      "200": {
        description: "Return files list result for a specific path.",
        content: {
          "application/json": {
            schema: z.object({
              files: z.array(PooleFTPFileSchema),
            }),
            example: {
              files: [
                {
                  type: "d",
                  name: "VITEL ENERGIA",
                  size: 4,
                  time: 1721043439,
                  perm: 509,
                  owner: 349071,
                  doc_type: "/",
                  doc_full_path: "/VITEL ENERGIA",
                },
              ],
            },
          },
        },
      },
      ...NotFoundException.schema(),
    },
  };

  async handle(c: AppContext) {
    const userInput = await this.getValidatedData<typeof this.schema>();
    const { path } = userInput.body;
    try {
      const files = await getFilesList(path);
      c.status(200);
      return {
        files,
      };
    } catch (e) {
      throw new NotFoundException(
        "Resource not found. Please validate input parameters and target resource existence."
      );
    }
  }
}
