import { PooleFTP_Client } from "./logic";

type AppContext = HonoContext<{ Bindings: Env }>;

export class AuthenticationException extends ApiException {
  default_message = "Authentication failed.";
  status = 401;
  code = 1000;
}

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
              success: z.boolean(),
              userToken: z.string(),
            }),
            example: {
              userToken: "1yD8qdLKDhxHXfT7DxYAzbuHK6a86SMx",
            },
          },
        },
      },
      ...AuthenticationException.schema(),
    },
  };

  async handle(c: AppContext) {
    const userToken = await PooleFTP_Client.getUserToken(c.env);
    c.status(200);
    return {
      success: true,
      userToken,
    };
  }
}
