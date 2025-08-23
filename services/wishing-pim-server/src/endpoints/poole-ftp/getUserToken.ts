import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Context } from "hono";

import { getUserToken } from "@/api/methods/poole-ftp";

type AppContext = Context<{ Bindings: Env }>;

export class GetUserToken extends OpenAPIRoute {
  schema = {
    tags: ["Poole-FTP"],
    summary: "Get userToken of Poole-FTP service.",
    request: {},
    responses: {
      "200": {
        description: "Successfully get poole-FTP service's userToken.",
        content: {
          "application/json": {
            schema: z.object({
              userToken: z.string(),
            }),
            example: {
                userToken: "1yD8qdLKDhxHXfT7DxYAzbuHK6a86SMx",
            }
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const { session_id: userToken } = await getUserToken();
    c.status(200);
    return {
      userToken,
    };
  }
}
