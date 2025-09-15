import { OpenAPIRoute, ApiException } from "chanfana";
import { z } from "zod";
import { Context } from "hono";

import { getUserToken } from "@/api/methods/poole-ftp";

type AppContext = Context<{ Bindings: Env }>;

export class TestDO extends OpenAPIRoute {
  schema = {
    tags: ["Test"],
    summary: "Test",
    request: {},
    responses: {
      "200": {
        description: "TEst",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              userToken: z.string(),
            }),
            example: {},
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const { COUNTER } = c.env;
    // const id = MY_DURABLE_OBJECT.idFromName("test");
    // const obj = MY_DURABLE_OBJECT.get(id);
    // const result = await obj.sayHello();
    const stub = COUNTER.get(COUNTER.idFromName("test"));
    const greeting = await stub.fetch("http://localhost:8787");
    return c.json({
      success: true,
      greeting,
    });
  }
}
